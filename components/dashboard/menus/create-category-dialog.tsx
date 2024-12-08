"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from '@/hooks/use-supabase';
import type { CreateMenuCategoryInput, MenuCategory } from '@/lib/types';

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuId: string;
  onCategoryCreated: (category: MenuCategory) => void;
}

export function CreateCategoryDialog({ 
  open, 
  onOpenChange, 
  menuId,
  onCategoryCreated 
}: CreateCategoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  // @ts-ignore
  const { client: supabase, user } = useSupabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!supabase) {
        toast({
          title: "Error",
          description: "Supabase client is not available",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // First, get the current highest sort_order
      const { data: existingCategories, error: fetchError } = await supabase
        .from('menu_categories')
        .select('sort_order')
        .eq('menu_id', menuId)
        .order('sort_order', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const nextSortOrder = existingCategories && existingCategories.length > 0 
        ? (existingCategories[0].sort_order + 1) 
        : 0;

      const formData: CreateMenuCategoryInput = {
        menu_id: menuId,
        name: (e.target as any).name.value,
        description: (e.target as any).description.value,
        sort_order: nextSortOrder
      };

      // @ts-ignore
      const { data, error } = await supabase
        .from('menu_categories')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      onCategoryCreated(data);
      toast({
        title: "Success",
        description: "Category created successfully",
      });

      (e.target as any).reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter category description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}