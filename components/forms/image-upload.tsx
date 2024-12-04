import { useState, useCallback } from "react"
import { FileWithPath, useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { ImageCropper } from "./image-cropper"

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  imageType?: "banner" | "logo"
  className?: string
}

export function ImageUpload({ value, onChange, imageType = "logo", className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!selectedFile) return;
    
    try {
      setIsUploading(true);
      const file = new File([croppedBlob], selectedFile.name, { type: 'image/jpeg' });
      await uploadImage(file);
    } catch (error) {
      console.error('Error uploading cropped image:', error);
      toast.error('Failed to upload cropped image');
    } finally {
      setIsUploading(false);
      setCropImageUrl(null);
      setSelectedFile(null);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: FileWithPath[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setSelectedFile(file);
    const imageUrl = URL.createObjectURL(file);
    setCropImageUrl(imageUrl);
  }, []);

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('restaurant-images')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-images')
        .getPublicUrl(filePath)

      onChange(publicUrl)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 1,
    multiple: false
  })

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      // Extract file name from URL
      const fileName = value?.split('/').pop()
      if (fileName) {
        const { error } = await supabase.storage
          .from('restaurant-images')
          .remove([fileName])

        if (error) throw error
      }
      onChange(null)
      toast.success('Image deleted successfully')
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Failed to delete image')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={className}>
      {cropImageUrl && (
        <ImageCropper
          imageUrl={cropImageUrl}
          aspect={imageType === 'banner' ? 3 : 1}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropImageUrl(null);
            setSelectedFile(null);
          }}
        />
      )}
      
      {!value ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
            hover:bg-accent/50 transition-colors
            ${isDragActive ? 'border-primary bg-accent/50' : 'border-muted-foreground/25'}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? (
                "Drop the image here"
              ) : (
                <>
                  Drag & drop {imageType} image here, or click to select
                  {imageType === 'banner' && (
                    <span className="block text-xs text-muted-foreground/75">
                      Recommended aspect ratio: 3:1
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <img
            src={value}
            alt={`Restaurant ${imageType}`}
            className={`w-full rounded-lg ${
              imageType === 'banner' ? 'aspect-[3/1] object-cover' : 'aspect-square object-contain'
            }`}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
