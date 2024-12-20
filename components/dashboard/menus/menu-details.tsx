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
      const supabase = await createClient()

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
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 outline outline-4 outline-[#f5f5f5] p-4 rounded-lg w-fu">
          <div className="flex-1 flex items-center flex-col gap-4">
            <div className="flex-1 w-full">
              <Label htmlFor="name">Menu Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="flex-1 w-full">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

          </div>
          <div className='flex align-center flex-col gap-4 justify-evenly m-auto'>
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
            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 max-w-3xl">
          
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

      <h2 className="text-2xl font-semibold">Menu Categories</h2>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Find items, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
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