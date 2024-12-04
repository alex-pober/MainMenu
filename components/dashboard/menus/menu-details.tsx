"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Search, ExternalLink, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MenuCategoryList } from '@/components/dashboard/menus/menu-category-list';
import { CreateCategoryDialog } from '@/components/dashboard/menus/create-category-dialog';
import { getMenuDetails } from '@/lib/services/menu-service';
import { supabase } from '@/lib/supabase';
import type { Menu, MenuCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function MenuDetails() {
  const params = useParams();
  const router = useRouter();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Add form state
  const [formData, setFormData] = useState<Partial<Menu>>({
    name: '',
    description: '',
    is_always_available: true,
    available_start_time: '00:00',
    available_end_time: '23:59'
  });

  useEffect(() => {
    if (menu) {
      setFormData({
        name: menu.name,
        description: menu.description,
        is_always_available: menu.is_always_available,
        available_start_time: menu.available_start_time || '00:00',
        available_end_time: menu.available_end_time || '23:59'
      });
    }
  }, [menu]);

  const handleSave = async () => {
    if (!menu) return;

    try {
      setIsSaving(true);
      const { data, error } = await supabase
        .from('menus')
        .update({
          name: formData.name,
          description: formData.description,
          is_always_available: formData.is_always_available,
          available_start_time: formData.available_start_time,
          available_end_time: formData.available_end_time
        })
        .eq('id', menu.id)
        .select()
        .single();

      if (error) throw error;

      setMenu(data);
      toast({
        title: "Success",
        description: "Menu updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchMenuDetails = async () => {
      if (!params.id) return;

      try {
        setIsLoading(true);
        const { menu, categories } = await getMenuDetails(params.id as string);
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
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 flex gap-4">
            <div className="flex-1">
              <Label htmlFor="name">Menu Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="flex items-center gap-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <Label htmlFor="availability" className="mb-0">Always Available</Label>
            <Switch
              id="availability"
              checked={formData.is_always_available}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, is_always_available: checked })
              }
            />
          </div>
          
          {!formData.is_always_available && (
            <div className="flex gap-4 items-center flex-1">
              <div className="flex-1">
                <Label htmlFor="start-time" className="text-sm">From</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={formData.available_start_time}
                  onChange={(e) => 
                    setFormData({ ...formData, available_start_time: e.target.value })
                  }
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="end-time" className="text-sm">Until</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={formData.available_end_time}
                  onChange={(e) => 
                    setFormData({ ...formData, available_end_time: e.target.value })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <h2 className="text-2xl font-semibold">Menu Categories</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search categories and items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <MenuCategoryList 
        categories={categories} 
        setCategories={setCategories}
        searchQuery={searchQuery}
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