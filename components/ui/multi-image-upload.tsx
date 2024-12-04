"use client";

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MultiImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (index: number) => void;
  className?: string;
}

export function MultiImageUpload({ 
  value = [], 
  onChange, 
  onRemove,
  className 
}: MultiImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const processFiles = async () => {
      const newImages = await Promise.all(
        acceptedFiles.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(file);
          });
        })
      );
      onChange([...value, ...newImages]);
    };

    processFiles();
  }, [value, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': []
    },
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-sm text-muted-foreground">
          <ImagePlus className="h-8 w-8 mb-2" />
          <p className="text-center">
            {isDragActive
              ? "Drop images here"
              : "Drag & drop images here, or click to select"}
          </p>
          <p className="text-xs mt-1">Maximum file size: 5MB</p>
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {value.map((image, index) => (
            <div key={index} className="relative group aspect-video">
              <Image
                src={image}
                alt={`Uploaded image ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}