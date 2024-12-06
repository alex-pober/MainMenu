import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { useSupabase } from "@/hooks/use-supabase"
import Image from 'next/image'
import { ImageIcon, X, Upload, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ImageUploadProps {
  value?: string;
  onChange?: (value: string) => void;
  onUploadComplete?: () => void;
  className?: string;
  imageType?: "banner" | "logo";
  uid: string;
}

export function ImageUpload({ 
  value,
  onChange,
  onUploadComplete,
  className,
  imageType = "logo",
  uid
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { client: supabase, error: supabaseError, isLoading } = useSupabase();

  useEffect(() => {
    if (supabaseError) {
      console.error('Supabase initialization error:', supabaseError);
      toast.error('Failed to initialize upload service');
    }
  }, [supabaseError]);

  useEffect(() => {
    if (!isLoading && supabase) {
      console.log('Checking Supabase storage availability:', {
        isStorageAvailable: !!supabase.storage,
        buckets: supabase.storage?.listBuckets
      });
    }
  }, [supabase, isLoading]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!supabase) {
        console.error('Supabase client not initialized');
        toast.error('Upload service not available');
        return;
      }

      if (!supabase.storage) {
        console.error('Supabase storage not configured');
        toast.error('Image upload service not configured');
        return;
      }

      if (acceptedFiles.length === 0) return;

      console.log('Starting file upload process');
      const file = acceptedFiles[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Validate file size (5MB limit)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > MAX_SIZE) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      setIsUploading(true);

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${imageType}_${Math.random()}.${fileExt}`;
        const filePath = `${uid}/${fileName}`;

        console.log('Uploading file:', {
          fileExt,
          fileName,
          filePath,
          uid
        });

        // First check if the bucket exists
        const { data: buckets, error: bucketsError } = await supabase.storage
          .listBuckets();

        if (bucketsError) {
          console.error('Error checking storage buckets:', bucketsError);
          throw new Error('Storage service unavailable');
        }

        const bucketExists = buckets.some(b => b.name === 'restaurant-images');
        if (!bucketExists) {
          console.error('Restaurant images bucket not found');
          throw new Error('Storage not properly configured');
        }

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('restaurant-images')
          .upload(filePath, file);

        console.log('Upload response:', {
          error: uploadError,
          data: uploadData
        });

        if (uploadError) {
          console.error('Upload error details:', {
            message: uploadError.message,
          });
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('restaurant-images')
          .getPublicUrl(filePath);

        console.log('Public URL generated:', publicUrl);

        if (onChange) {
          onChange(publicUrl);
        }

        if (onUploadComplete) {
          onUploadComplete();
        }

        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Upload process error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    },
    [supabase, onChange, onUploadComplete, imageType, uid]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

  const removeImage = useCallback(() => {
    if (onChange) {
      onChange('');
    }
  }, [onChange]);

  const containerClasses = cn(
    "relative flex flex-col items-center justify-center rounded-lg border border-dashed p-6 transition-all hover:bg-accent/5",
    isDragActive && "border-muted-foreground/50",
    !value && "hover:border-muted-foreground/50",
    imageType === "banner" ? "h-24" : "h-22",
    className
  );

  return (
    <div className={containerClasses}>
      <div {...getRootProps()} className="w-full h-full">
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : value ? (
          <div className="relative w-full h-full">
            <Image
              src={value}
              alt="Uploaded image"
              className="object-contain"
              fill
              sizes={imageType === "banner" ? "100vw" : "400px"}
              priority
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
              <Upload className="h-8 w-8" />
            </div>
            <p className="text-sm text-muted-foreground">
              Drag & drop or click to upload
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
