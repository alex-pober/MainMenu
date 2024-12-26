"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Menu, MenuCategory } from '@/lib/types';
import { MenuDetails } from './menu-details';
import { ItemFilter } from './item-filter';

interface MenuTabsProps {
  userId: string;
}
//@ts-ignore
export function MenuTabs({ userId, menus, profile }: MenuTabsProps) {
  const [categories, setCategories] = useState<Record<string, MenuCategory[]>>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(menus[0].id);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [availableLabels, setAvailableLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (menus && menus.length > 0) {
      console.log('Menu data fetched:', menus);
      // setMenus(menus);
      const categoriesMap: Record<string, MenuCategory[]> = {};
      menus.forEach((menu: Menu) => {
        if (menu.menu_categories) {
          console.log('Menu categories for', menu.name, ':', menu.menu_categories);
          categoriesMap[menu.id] = menu.menu_categories;
        }
      });
      setCategories(categoriesMap);
      setActiveMenu(menus[0].id);

      // Organize categories by menu_id and sort them by sort_order
      const categoriesByMenu: Record<string, MenuCategory[]> = {};
      const labels = new Set<string>();
      
      menus.forEach(menu => {
        const sortedCategories = (menu.menu_categories || []).sort(
          (a, b) => a.sort_order - b.sort_order
        );
        
        // Collect all used labels
        sortedCategories.forEach(category => {
          category.menu_items?.forEach(item => {
            if (item.is_vegan) labels.add('vegan');
            if (item.is_vegetarian) labels.add('vegetarian');
            if (item.is_spicy) labels.add('spicy');
            if (item.is_new) labels.add('new');
            if (item.is_limited_time) labels.add('limited');
            if (item.is_most_popular) labels.add('popular');
            if (item.is_special) labels.add('special');
          });
        });
        
        categoriesByMenu[menu.id] = sortedCategories;
      });
      
      setCategories(categoriesByMenu);
      setAvailableLabels(Array.from(labels));
      setIsLoading(false);

  }}, [menus]);

  const handleMenuChange = (value: string) => {
    setActiveMenu(value);
    const menuContainer = document.querySelector('.menu-content-container');
    if (menuContainer) {
      const headerOffset = 120;
      window.scrollTo({
        //@ts-ignore
        top: menuContainer.offsetTop - headerOffset,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No active menus found.</p>
      </div>
    );
  }

  return (
    <Tabs value={activeMenu || undefined} onValueChange={handleMenuChange} className="w-full max-w-5xl mx-auto">
      <div className="sticky top-0 z-40 backdrop-blur">
        <div className="w-full max-w-2xl mx-auto">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-full bg-muted p-1 w-full">
              {menus.map((menu) => (
                <TabsTrigger
                  key={menu.id}
                  value={menu.id}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  {menu.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {menus.map((menu) => (
          <TabsContent key={menu.id} value={menu.id} className="mt-0 py-2 w-full max-w-2xl mx-auto">
            {menu.description && (
              <p className="text-sm text-muted-foreground text-center p-1">
                {menu.description}
              </p>
            )}
          </TabsContent>
        ))}

        {availableLabels.length > 0 && (
          <div className="relative w-full mb-2">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-transparent backdrop-blur supports-[backdrop-filter]:bg-gradient-to-b supports-[backdrop-filter]:from-transparent supports-[backdrop-filter]:via-background/50 supports-[backdrop-filter]:to-transparent" />
            <div className="relative">
              <ItemFilter availableLabels={availableLabels} onFilterChange={setActiveFilters} />
            </div>
          </div>
        )}
      </div>

      <div className="menu-content-container">
        {menus.map((menu) => (
          <TabsContent key={menu.id} value={menu.id} className="m-0 outline-none ring-0">
            <MenuDetails menu={menu} categories={categories[menu.id] || []} activeFilters={activeFilters} />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
