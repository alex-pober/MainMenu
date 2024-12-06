// @ts-nocheck
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { useToast } from "@/hooks/use-toast";
import { updateMenuItem } from '@/lib/services/menu-items';
import type { MenuItem } from '@/lib/types';

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem;
  onItemUpdated: (item: MenuItem) => void;
}

export function EditItemDialog({ 
  open, 
  onOpenChange, 
  item,
  onItemUpdated 
}: EditItemDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<string[]>(item.image_urls);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: item.name,
    description: item.description,
    price: item.price,
    is_available: item.is_available,
    is_spicy: item.is_spicy || false,
    is_new: item.is_new || false,
    is_limited_time: item.is_limited_time || false,
    is_most_popular: item.is_most_popular || false,
    is_special: item.is_special || false,
    is_vegan: item.is_vegan || false,
    is_vegetarian: item.is_vegetarian || false
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Starting item update...');
      const updatedItem = await updateMenuItem(
        item.id,
        formData,
        imageFiles,
        item.image_urls
      );

      onItemUpdated(updatedItem);
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Item Images</Label>
              <MultiImageUpload
                value={imageFiles}
                onChange={setImageFiles}
                onRemove={(index) => {
                  setImageFiles(prev => prev.filter((_, i) => i !== index));
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                placeholder="Enter item name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-4">
              <Label>Item Labels</Label>
              <div className="grid grid-cols-1 gap-2 border rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_vegan"
                    checked={formData.is_vegan}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_vegan: checked as boolean })}
                  />
                  <Label htmlFor="is_vegan" className="text-sm font-normal cursor-pointer">
                    Vegan 🌱
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_vegetarian"
                    checked={formData.is_vegetarian}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_vegetarian: checked as boolean })}
                  />
                  <Label htmlFor="is_vegetarian" className="text-sm font-normal cursor-pointer">
                    Vegetarian 🥚
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_spicy"
                    checked={formData.is_spicy}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_spicy: checked as boolean })}
                  />
                  <Label htmlFor="is_spicy" className="text-sm font-normal cursor-pointer">
                    Spicy 🌶️
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_new"
                    checked={formData.is_new}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked as boolean })}
                  />
                  <Label htmlFor="is_new" className="text-sm font-normal cursor-pointer">
                    New ✨
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_limited_time"
                    checked={formData.is_limited_time}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_limited_time: checked as boolean })}
                  />
                  <Label htmlFor="is_limited_time" className="text-sm font-normal cursor-pointer">
                    Limited Time ⏳
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_most_popular"
                    checked={formData.is_most_popular}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_most_popular: checked as boolean })}
                  />
                  <Label htmlFor="is_most_popular" className="text-sm font-normal cursor-pointer">
                    Most Popular 🔥
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_special"
                    checked={formData.is_special}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_special: checked as boolean })}
                  />
                  <Label htmlFor="is_special" className="text-sm font-normal cursor-pointer">
                    Special ⭐
                  </Label>
                </div>
              </div>
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
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}