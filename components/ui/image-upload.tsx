"use client";

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  className?: string;
}

export function ImageUpload({ value, onChange, onRemove, className }: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsLoading(true);
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string);
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error processing image:', error);
        setIsLoading(false);
      }
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 2 * 1024 * 1024 // 2MB
  });

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition cursor-pointer",
          isDragActive && "border-primary bg-muted/50",
          value && "border-none p-0"
        )}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : value ? (
          <div className="relative aspect-video w-full">
            <Image
              src={value}
              alt="Upload preview"
              fill
              className="object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground p-8">
            <ImageIcon className="h-8 w-8" />
            <div className="text-center">
              <p>Drag & drop an image here, or click to select</p>
              <p className="text-sm">PNG, JPG, JPEG up to 2MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}