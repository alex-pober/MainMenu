"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: string[];
  className?: string;
}

export function ImageCarousel({ images = [], className }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  if (images.length === 1) {
    return (
      <div className={cn("relative aspect-video w-full rounded-lg overflow-hidden", className)}>
        <Image
          src={images[0]}
          alt="Menu item"
          fill
          className="object-cover"
        />
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={cn("relative aspect-video w-full rounded-lg overflow-hidden group", className)}>
      <Image
        src={images[currentIndex]}
        alt="Menu item"
        fill
        className="object-cover transition-all"
      />
      
      <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="icon"
          onClick={previousImage}
          className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={nextImage}
          className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {images.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              index === currentIndex
                ? "bg-primary"
                : "bg-primary/50 hover:bg-primary/75"
            )}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}