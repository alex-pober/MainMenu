"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Menu, MenuCategory } from '@/lib/types';
import { MenuDetails } from './menu-details';
import { DietaryFilter } from './dietary-filter';

interface MenuTabsProps {
  userId: string;
}

export function MenuTabs({ userId }: MenuTabsProps) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Record<string, MenuCategory[]>>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [availableDietaryOptions, setAvailableDietaryOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const { data: menuData, error: menuError } = await supabase
          .from('menus')
          .select(`
            *,
            menu_categories (
              *,
              menu_items (*)
            )
          `)
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('display_order', { ascending: true });

        if (menuError) throw menuError;

        if (menuData && menuData.length > 0) {
          setMenus(menuData);
          setActiveMenu(menuData[0].id);

          // Organize categories by menu_id and sort them by sort_order
          const categoriesByMenu: Record<string, MenuCategory[]> = {};
          const dietaryOptions = new Set<string>();
          
          menuData.forEach(menu => {
            const sortedCategories = (menu.menu_categories || []).sort(
              (a, b) => a.sort_order - b.sort_order
            );
            
            // Collect all unique dietary options
            sortedCategories.forEach(category => {
              category.menu_items?.forEach(item => {
                item.dietary_info?.forEach(info => {
                  dietaryOptions.add(info.toLowerCase());
                });
              });
            });
            
            categoriesByMenu[menu.id] = sortedCategories;
          });
          
          setCategories(categoriesByMenu);
          setAvailableDietaryOptions(Array.from(dietaryOptions).sort());
        }
      } catch (error) {
        console.error('Error fetching menus:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenus();
  }, [userId, supabase]);

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
    <Tabs value={activeMenu || undefined} onValueChange={setActiveMenu}>
      <div className="flex justify-center">
        <ScrollArea className="w-auto">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1">
            {menus.map((menu) => (
              <TabsTrigger
                key={menu.id}
                value={menu.id}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-6 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                {menu.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <DietaryFilter 
        availableOptions={availableDietaryOptions}
        onFilterChange={setActiveFilters} 
      />

      {menus.map((menu) => (
        <TabsContent key={menu.id} value={menu.id} className="mt-4">
          <MenuDetails menu={menu} categories={categories[menu.id] || []} activeFilters={activeFilters} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
