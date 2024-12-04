// @ts-nocheck
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Menu, MenuCategory } from "@/lib/types";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MenuDetailsProps {
  menu: Menu;
  categories: MenuCategory[];
}

interface MenuItemDialogProps {
  item: any;
  open: boolean;
  onOpenChange: (open: boolean) => void
}

function MenuItemDialog({ item, open, onOpenChange }: MenuItemDialogProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="max-w-2xl w-full mx-auto h-full flex flex-col">
          <DrawerHeader className="px-4 pt-6 flex-shrink-0">
            <DrawerTitle className="text-2xl">{item.name}</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-16">
            {item.image_urls && item.image_urls.length > 0 && (
              <div className="space-y-6 mb-8">
                <div className="relative">
                  <div className="aspect-[16/10] overflow-hidden rounded-lg">
                    <img
                      src={item.image_urls[selectedImageIndex]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {item.image_urls.length > 1 && (
                  <div className="flex justify-center gap-3 overflow-x-auto pb-2">
                    {item.image_urls.map((imageUrl: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative flex-shrink-0 w-24 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                          index === selectedImageIndex ? 'border-primary' : 'border-transparent hover:border-primary/50'
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt={`${item.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="space-y-6">
              {item.description && (
                <p className="text-muted-foreground text-lg leading-relaxed">{item.description}</p>
              )}
              {item.dietary_info?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.dietary_info.map((info: string) => (
                    <Badge key={info} variant="outline" className="text-sm px-3 py-1">
                      {info}
                    </Badge>
                  ))}
                </div>
              )}
              {!item.is_available && (
                <Badge variant="secondary" className="text-sm px-3 py-1">Currently Unavailable</Badge>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export function MenuDetails({ menu, categories }: MenuDetailsProps) {
  const isCurrentlyAvailable = (menu: Menu) => {
    if (menu.is_always_available) return true;
    
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    return currentTime >= menu.available_start_time! && 
           currentTime <= menu.available_end_time!;
  };

  const getAvailabilityText = (menu: Menu) => {
    if (menu.is_always_available) {
      return null;
    }
    return `Available ${menu.available_start_time} - ${menu.available_end_time}`;
  };

  const isAvailable = isCurrentlyAvailable(menu);
  const availabilityText = getAvailabilityText(menu);

  const [selectedItem, setSelectedItem] = useState<any | null>(null)

  return (
    <div className="space-y-4">
      {(menu.description || !isAvailable || availabilityText) && (
        <div className="text-center space-y-3">
          {menu.description && (
            <p className="text-muted-foreground">{menu.description}</p>
          )}
          <div className="flex justify-center gap-2">
            {!isAvailable && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Currently Unavailable
              </Badge>
            )}
            {availabilityText && (
              <Badge variant="outline">
                {availabilityText}
              </Badge>
            )}
          </div>
        </div>
      )}

      {selectedItem && (
        <MenuItemDialog
          item={selectedItem}
          open={!!selectedItem}
          onOpenChange={(open) => !open && setSelectedItem(null)}
        />
      )}
      <div className="space-y-2">
        {categories.map((category) => (
          <Collapsible key={category.id}>
            <div>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group pl-0 pr-2">
                <div className="space-y-0.5 text-left">
                  <h4 className="text-lg font-semibold leading-none">{category.name}</h4>
                  {category.description && (
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <div className="h-px bg-border" />
            </div>
            
            <CollapsibleContent>
              <div className="pt-2 pb-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {category.menu_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center gap-2">
                            <h5 className="font-medium truncate">{item.name}</h5>
                            <div className="text-sm text-muted-foreground font-medium whitespace-nowrap">${item.price.toFixed(2)}</div>
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground/80 line-clamp-2 text-pretty">{item.description}</p>
                          )}
                          {(item.dietary_info?.length > 0 || !item.is_available) && (
                            <div className="flex flex-wrap gap-1">
                              {!item.is_available && (
                                <Badge variant="secondary" className="text-xs">Unavailable</Badge>
                              )}
                              {item.dietary_info?.map((info: string) => (
                                <Badge key={info} variant="outline" className="text-xs">
                                  {info}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {item.image_urls?.[0] && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.image_urls[0]}
                            alt={item.name}
                            className="h-16 w-16 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
