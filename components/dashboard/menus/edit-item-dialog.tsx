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

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten Free' },
  { id: 'dairy-free', label: 'Dairy Free' }
];

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
    dietary_info: item.dietary_info,
    allergens: item.allergens
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

  const handleDietaryChange = (optionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      dietary_info: checked
        ? [...(prev.dietary_info || []), optionId]
        : (prev.dietary_info || []).filter(id => id !== optionId)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter item description"
                value={formData.description}
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
            <div className="space-y-2">
              <Label>Dietary Information</Label>
              <div className="grid grid-cols-2 gap-2">
                {DIETARY_OPTIONS.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={formData.dietary_info?.includes(option.id)}
                      onCheckedChange={(checked) => 
                        handleDietaryChange(option.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={option.id}>{option.label}</Label>
                  </div>
                ))}
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