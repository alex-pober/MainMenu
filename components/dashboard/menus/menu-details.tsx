// @ts-nocheck
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Search, ExternalLink, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MenuCategoryList } from '@/components/dashboard/menus/menu-category-list';
import { CreateCategoryDialog } from '@/components/dashboard/menus/create-category-dialog';
import { getMenuDetails } from '@/lib/services/menu-service';
import { createBrowserClient } from '@supabase/ssr';
import type { Menu, MenuCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';

export function MenuDetails() {
  const params = useParams();
  const router = useRouter();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(false);
  const { toast } = useToast();
  //   if (!menu) return;

  //   try {
  //     setIsSaving(true);
  //     const supabase = await createClient()

  //     const { data, error } = await supabase
  //       .from('menus')
  //       .update({
  //         name: formData.name,
  //         description: formData.description,
  //         is_always_available: formData.is_always_available,
  //         available_start_time: formData.available_start_time,
  //         available_end_time: formData.available_end_time
  //       })
  //       .eq('id', menu.id)
  //       .select()
  //       .single();

  //     if (error) throw error;

  //     setMenu(data);
  //     toast({
  //       title: "Success",
  //       description: "Menu updated successfully",
  //     });
  //   } catch (error: any) {
  //     toast({
  //       title: "Error",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  useEffect(() => {
    const fetchMenuDetails = async () => {
      if (!params.id) return;

      try {
        setIsLoading(true);
        const supabase = await createClient()
        const { menu, categories } = await getMenuDetails(params.id as string, supabase);
        setMenu(menu);
        setCategories(categories);
      } catch (error: any) {
        console.error('Error fetching menu details:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load menu details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuDetails();
  }, [params.id, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-lg font-semibold">Menu not found</h2>
        <p className="text-sm text-muted-foreground">The requested menu could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Menu Categories</h2>
        <Button 
          variant="outline" 
          onClick={() => setExpandedCategories(prev => !prev)}
        >
          {expandedCategories ? (
            <>
              <ChevronUp className="mr-1 h-3 w-3" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-3 w-3" />
              Expand All
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Find items, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className=" sm:w-auto">
            {/* <Plus className="mr-2 h-4 w-4" /> */}
            New Category
          </Button>
      </div>

      <MenuCategoryList 
        categories={categories} 
        setCategories={setCategories}
        searchQuery={searchQuery}
        expandedCategories={expandedCategories}
      />

      <CreateCategoryDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        menuId={menu.id}
        onCategoryCreated={(category) => {
          setCategories([...categories, category]);
        }}
      />
    </div>
  );
}