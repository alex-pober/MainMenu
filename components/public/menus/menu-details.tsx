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

export function MenuDetails({ menu, categories, activeFilters }: MenuDetailsProps) {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  // Minimum swipe distance in pixels
  const minSwipeDistance = 50;

  useEffect(() => {
    if (selectedCategory) {
      setIsSidebarOpen(true);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (isSidebarOpen) {
      scrollPositionRef.current = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollPositionRef.current}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: 'instant'
      });
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    // Reset image index when selecting a new item
    setCurrentImageIndex(0);
  }, [selectedItem]);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setTimeout(() => setSelectedCategory(null), 300); // Wait for animation to complete
  };

  const onTouchStart = (e: React.TouchEvent, forImage?: boolean) => {
    if (!forImage && !isSidebarOpen) return;
    if (forImage) {
      e.stopPropagation();
    }
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent, forImage?: boolean) => {
    if (!forImage && !isSidebarOpen) return;
    if (forImage) {
      e.stopPropagation();
    }
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e: React.TouchEvent | null, forImage?: boolean, imageUrls?: string[]) => {
    if (!touchStart || !touchEnd) return;
    if (forImage && e) {
      e.stopPropagation();
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (forImage && imageUrls) {
      if (isLeftSwipe && currentImageIndex < imageUrls.length - 1) {
        setCurrentImageIndex(prev => prev + 1);
      } else if (isRightSwipe && currentImageIndex > 0) {
        setCurrentImageIndex(prev => prev - 1);
      }
    } else if (isRightSwipe && isSidebarOpen) {
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
    if (activeFilters.length === 0) return items.sort((a, b) => a.sort_order - b.sort_order);
    return items
      .filter(item => 
        activeFilters.every(filter => {
          switch (filter) {
            case 'vegan': return item.is_vegan;
            case 'vegetarian': return item.is_vegetarian;
            case 'spicy': return item.is_spicy;
            case 'new': return item.is_new;
            case 'limited': return item.is_limited_time;
            case 'popular': return item.is_most_popular;
            case 'special': return item.is_special;
            default: return false;
          }
        })
      )
      .sort((a, b) => a.sort_order - b.sort_order);
  };

  return (
    <div>
      {(menu.description || !isAvailable || availabilityText) && (
        <div className="text-center space-y-3">
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
      <div className={cn(
        "max-w-2xl mx-auto space-y-3 pb-32",
        isSidebarOpen && "lg:opacity-50 pointer-events-none transition-opacity duration-300"
      )}>
        {/* THIS IS THE MENU CATEGORIES LIST */}
        {categories.map((category) => {
          const filteredItems = filterItems(category.menu_items);
          if (activeFilters.length > 0 && filteredItems.length === 0) return null;
          
          return (
            <Card
              key={category.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/50 rounded-xl",
                selectedCategory?.id === category.id && "bg-muted"
              )}
              onClick={(e) => {
                e.preventDefault();
                setSelectedCategory(category);
              }}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-center gap-4">
                  <div className="space-y-1.5">
                    <h4 className="text-xl font-semibold leading-none">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-nowrap">
                    {filteredItems.length} items
                  </p>
                </div>
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
          "w-[calc(100%-16px)] [@media(min-width:520px)]:w-[500px] lg:w-[540px] rounded-tl-3xl", 
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
            <div className="p-4 lg:p-6 pb-32 divide-y divide-border">
              {selectedCategory && filterItems(selectedCategory.menu_items).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col cursor-pointer hover:bg-muted/50 py-6 first:pt-0 last:pb-0 rounded-lg transition-colors"
                  onClick={() => setSelectedItem(item)}
                >
                  {item.image_urls?.[0] && (
                    <div className="w-full mb-4">
                      <div 
                        className="relative aspect-[16/10] w-full overflow-hidden rounded-lg"
                        onTouchStart={(e) => onTouchStart(e, true)}
                        onTouchMove={(e) => onTouchMove(e, true)}
                        onTouchEnd={(e) => onTouchEnd(e, true, item.image_urls)}
                      >
                        <Image
                          src={item.image_urls[currentImageIndex] || item.image_urls[0]}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        {item.image_urls.length > 1 && (
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                            {item.image_urls.map((_, index) => (
                              <div
                                key={index}
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  index === currentImageIndex
                                    ? "bg-white"
                                    : "bg-white/50"
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h5 className="text-lg font-medium">{item.name}</h5>
                      <div className="text-base font-medium whitespace-nowrap">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground/80 line-clamp-2 text-pretty">
                        {item.description}
                      </p>
                    )}
                    {(item.is_spicy || item.is_new || item.is_limited_time || item.is_most_popular || item.is_special || item.is_vegan || item.is_vegetarian || !item.is_available) && (
                      <div className="flex flex-wrap gap-1.5">
                        {!item.is_available && (
                          <Badge variant="secondary">Unavailable</Badge>
                        )}
                        {item.is_vegan && (
                          <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200">
                            🌱 Vegan
                          </Badge>
                        )}
                        {item.is_vegetarian && (
                          <Badge variant="outline" className="text-xs bg-lime-100 text-lime-800 border-lime-200">
                            🥚 Vegetarian
                          </Badge>
                        )}
                        {item.is_spicy && (
                          <Badge variant="outline" className="text-xs bg-red-100 text-red-800 border-red-200">
                            🌶️ Spicy
                          </Badge>
                        )}
                        {item.is_new && (
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                            ✨ New
                          </Badge>
                        )}
                        {item.is_limited_time && (
                          <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                            ⏳ Limited Time
                          </Badge>
                        )}
                        {item.is_most_popular && (
                          <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                            🔥 Most Popular
                          </Badge>
                        )}
                        {item.is_special && (
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                            ⭐ Special
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
