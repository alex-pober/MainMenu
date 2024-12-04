"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog';
import type { MenuCategory } from '@/lib/types';

interface MenuItemsProps {
  categories: MenuCategory[];
}

export function MenuItems({ categories }: MenuItemsProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="space-y-8 mb-16">
      {categories.map((category) => (
        <section key={category.id} id={`category-${category.id}`} className="scroll-mt-16">
          <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
          {category.description && (
            <p className="text-muted-foreground mb-4">{category.description}</p>
          )}
          <div className="space-y-4">
            {category.menu_items.map((item) => (
              <div
                key={item.id}
                data-menu-item
                data-item-name={item.name}
                data-item-description={item.description}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card"
              >
                {item.image_url && (
                  <div 
                    className="relative flex-shrink-0 w-20 h-20 cursor-pointer"
                    onClick={() => setSelectedImage(item.image_url)}
                  >
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex-grow">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${item.price.toFixed(2)}
                      </div>
                      {!item.is_available && (
                        <Badge variant="secondary" className="mt-1">
                          Unavailable
                        </Badge>
                      )}
                    </div>
                  </div>
                  {(item.dietary_info?.length > 0 || item.allergens?.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.dietary_info?.map((info) => (
                        <Badge key={info} variant="outline">
                          {info}
                        </Badge>
                      ))}
                      {item.allergens?.map((allergen) => (
                        <Badge key={allergen} variant="destructive">
                          Contains {allergen}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      <ImagePreviewDialog
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
      />
    </div>
  );
}