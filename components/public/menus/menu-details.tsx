// @ts-nocheck
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Menu, MenuCategory } from "@/lib/types";
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import Image from 'next/image';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle 
} from "@/components/ui/drawer";

interface MenuDetailsProps {
  menu: Menu;
  categories: MenuCategory[];
  activeFilters: string[];
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
                    <Image
                      src={item.image_urls[selectedImageIndex]}
                      alt={item.name}
                      width={640}
                      height={400}
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
                        <Image
                          src={imageUrl}
                          alt={`${item.name} - Image ${index + 1}`}
                          width={96}
                          height={64}
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

export function MenuDetails({ menu, categories, activeFilters }: MenuDetailsProps) {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance in pixels
  const minSwipeDistance = 50;

  useEffect(() => {
    if (selectedCategory) {
      setIsSidebarOpen(true);
    }
  }, [selectedCategory]);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setTimeout(() => setSelectedCategory(null), 300); // Wait for animation to complete
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // If swiping right when sidebar is open, close it
    if (isRightSwipe && isSidebarOpen) {
      closeSidebar();
    }
  };

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

  const filterItems = (items: MenuItem[] = []) => {
    if (activeFilters.length === 0) return items;
    return items.filter(item => 
      activeFilters.every(filter => 
        item.dietary_info?.includes(filter)
      )
    );
  };

  return (
    <div className="relative">
      {(menu.description || !isAvailable || availabilityText) && (
        <div className="text-center space-y-3">
          {menu.description && (
            <p className="text-muted-foreground">{menu.description}</p>
          )}
          {!isAvailable && (
            <p className="text-sm text-yellow-600 dark:text-yellow-500">
              This menu is currently unavailable
            </p>
          )}
          {availabilityText && (
            <p className="text-sm text-muted-foreground">
              {availabilityText}
            </p>
          )}
        </div>
      )}
      {selectedItem && (
        <MenuItemDialog
          item={selectedItem}
          open={!!selectedItem}
          onOpenChange={(open) => !open && setSelectedItem(null)}
        />
      )}
      <div className={cn(
        "grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 transition-[margin] duration-300",
        isSidebarOpen && "lg:mr-[540px]"
      )}>
        {categories.map((category) => {
          const filteredItems = filterItems(category.menu_items);
          if (activeFilters.length > 0 && filteredItems.length === 0) return null;
          
          return (
            <Card
              key={category.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/50",
                selectedCategory?.id === category.id && "bg-muted"
              )}
              onClick={() => setSelectedCategory(category)}
            >
              <CardContent className="p-4 space-y-1.5">
                <h4 className="text-lg font-semibold leading-none">{category.name}</h4>
                {category.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {filteredItems.length} items
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dark overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 transition-opacity duration-300 z-40",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeSidebar}
      />

      <div
        ref={sidebarRef}
        className={cn(
          "fixed top-[16px] right-0 h-screen bg-background border-l transform transition-transform duration-300 ease-in-out overflow-hidden z-50",
          "w-[calc(100%-16px)] lg:w-[540px] rounded-tl-3xl", // Leave 16px gap on mobile
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="h-full flex flex-col">
          <div className="flex-shrink-0 border-b p-4 lg:p-6 sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl lg:text-2xl font-semibold truncate">{selectedCategory?.name}</h2>
              <Button variant="ghost" size="icon" onClick={closeSidebar} className="flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            {selectedCategory?.description && (
              <p className="text-muted-foreground mt-2 text-sm lg:text-base">{selectedCategory.description}</p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 lg:p-6 space-y-4">
              {selectedCategory && filterItems(selectedCategory.menu_items).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 lg:gap-4 cursor-pointer hover:bg-muted/50 p-3 rounded-lg transition-colors"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center gap-2">
                        <h5 className="font-medium truncate">{item.name}</h5>
                        <div className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground/80 line-clamp-2 text-pretty">
                          {item.description}
                        </p>
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
                      <Image
                        src={item.image_urls[0]}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="h-16 w-16 lg:h-20 lg:w-20 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
