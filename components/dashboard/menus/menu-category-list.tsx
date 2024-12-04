"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical } from 'lucide-react';
import { MenuItemList } from './menu-item-list';
import { CreateItemDialog } from './create-item-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { MenuCategory, MenuItem } from '@/lib/types';

interface MenuCategoryListProps {
  categories: MenuCategory[];
  setCategories: (categories: MenuCategory[]) => void;
  searchQuery: string;
}

export function MenuCategoryList({ categories, setCategories, searchQuery }: MenuCategoryListProps) {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [isCreateItemDialogOpen, setIsCreateItemDialogOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState<Record<string, MenuItem[]>>({});
  const { toast } = useToast();

  // Fetch items for all categories when component mounts or categories change
  useEffect(() => {
    const fetchItemsForCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .in('category_id', categories.map(c => c.id))
          .order('sort_order');

        if (error) throw error;

        // Group items by category
        const itemsByCategory = data.reduce((acc: Record<string, MenuItem[]>, item) => {
          if (!acc[item.category_id]) {
            acc[item.category_id] = [];
          }
          acc[item.category_id].push(item);
          return acc;
        }, {});

        setCategoryItems(itemsByCategory);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    if (categories.length > 0) {
      fetchItemsForCategories();
    }
  }, [categories]);

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(categories.filter(category => category.id !== categoryId));
      
      // Remove items for the deleted category
      const newCategoryItems = { ...categoryItems };
      delete newCategoryItems[categoryId];
      setCategoryItems(newCategoryItems);

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleItemCreated = (categoryId: string, newItem: MenuItem) => {
    setCategoryItems(prevItems => ({
      ...prevItems,
      [categoryId]: [...(prevItems[categoryId] || []), newItem].sort((a, b) => a.sort_order - b.sort_order)
    }));
  };

  const handleItemsUpdated = (categoryId: string, items: MenuItem[]) => {
    setCategoryItems(prevItems => ({
      ...prevItems,
      [categoryId]: items.sort((a, b) => a.sort_order - b.sort_order)
    }));
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {filteredCategories.map((category) => (
        <div key={category.id} className="group">
          <Card className="transition-all duration-200 hover:shadow-md bg-gradient-to-r from-background to-muted border-l-4 border-l-primary/20 group-hover:border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl transition-colors group-hover:text-primary">
                  {category.name}
                </CardTitle>
                {category.description && (
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsCreateItemDialogOpen(true);
                  }}
                  className="transition-all hover:border-primary hover:text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:text-primary">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      Delete Category
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <MenuItemList 
                categoryId={category.id} 
                searchQuery={searchQuery}
                items={categoryItems[category.id] || []}
                onItemsChange={(items) => handleItemsUpdated(category.id, items)}
              />
            </CardContent>
          </Card>
        </div>
      ))}

      {selectedCategory && (
        <CreateItemDialog
          open={isCreateItemDialogOpen}
          onOpenChange={setIsCreateItemDialogOpen}
          categoryId={selectedCategory.id}
          onItemCreated={(newItem) => handleItemCreated(selectedCategory.id, newItem)}
        />
      )}
    </div>
  );
}