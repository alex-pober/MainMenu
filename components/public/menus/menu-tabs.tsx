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

export function MenuTabs({ userId }: MenuTabsProps) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Record<string, MenuCategory[]>>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [availableLabels, setAvailableLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const { data: menuData, error: menuError } = await supabase
          .from('menus')
          .select(`
            id,
            user_id,
            name,
            description,
            status,
            display_order,
            is_always_available,
            available_start_time,
            available_end_time,
            created_at,
            updated_at,
            menu_categories (
              id,
              menu_id,
              name,
              description,
              sort_order,
              created_at,
              updated_at,
              menu_items (
                id,
                category_id,
                name,
                description,
                price,
                image_urls,
                is_available,
                is_spicy,
                is_new,
                is_limited_time,
                is_most_popular,
                is_special,
                is_vegan,
                is_vegetarian,
                sort_order,
                created_at,
                updated_at
              )
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
          const labels = new Set<string>();
          
          menuData.forEach(menu => {
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
    <Tabs value={activeMenu || undefined} onValueChange={setActiveMenu} className="w-full max-w-5xl mx-auto px-4">
      <div className="flex flex-col items-center space-y-4 mb-6">
        <div className="w-full max-w-2xl">
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
          <TabsContent key={menu.id} value={menu.id} className="w-full max-w-2xl">
            {menu.description && (
              <p className="text-sm text-muted-foreground text-center">{menu.description}</p>
            )}
          </TabsContent>
        ))}

        {availableLabels.length > 0 && (
          <div className="w-full border-t border-b py-3 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50">
            <ItemFilter availableLabels={availableLabels} onFilterChange={setActiveFilters} />
          </div>
        )}
      </div>

      {menus.map((menu) => (
        <TabsContent key={menu.id} value={menu.id} className="mt-0 outline-none ring-0">
          <MenuDetails menu={menu} categories={categories[menu.id] || []} activeFilters={activeFilters} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
