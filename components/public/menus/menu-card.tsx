// @ts-nocheck
"use client";

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MenuCategories } from './menu-categories';
import { createBrowserClient } from '@supabase/ssr';
import type { Menu, MenuCategory } from '@/lib/types';

interface MenuCardProps {
  menu: Menu;
  isExpanded: boolean;
  onToggle: () => void;
}

export function MenuCard({ menu, isExpanded, onToggle }: MenuCardProps) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!isExpanded) return;

      try {
        setIsLoading(true);
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data, error } = await supabase
          .from('menu_categories')
          .select('*')
          .eq('menu_id', menu.id)
          .order('sort_order');

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [menu.id, isExpanded]);

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{menu.name}</CardTitle>
            {menu.description && (
              <p className="text-sm text-muted-foreground">{menu.description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`} />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {menu.is_always_available ? (
            <Badge variant="secondary">Always Available</Badge>
          ) : (
            <Badge variant="secondary">
              Available {menu.available_start_time} - {menu.available_end_time}
            </Badge>
          )}
          <Badge variant={menu.status === 'active' ? 'default' : 'secondary'}>
            {menu.status}
          </Badge>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-lg" />
              ))}
            </div>
          ) : (
            <MenuCategories menuId={menu.id} categories={categories} />
          )}
        </CardContent>
      )}
    </Card>
  );
}