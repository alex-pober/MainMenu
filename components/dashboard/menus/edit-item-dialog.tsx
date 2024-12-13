// @ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateMenuItem } from '@/lib/services/menu-items';
import { uploadImages } from '@/lib/utils/upload';
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
  const [imageFiles, setImageFiles] = useState<string[]>(item?.image_urls || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<MenuItem>>({});
  const { toast } = useToast();

  // Update form data when item changes or dialog opens
  useEffect(() => {
    if (open && item) {
      setFormData({
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
        is_vegetarian: item.is_vegetarian || false,
        addons: item.addons || []
      });
    }
  }, [item, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setNewFiles(files);
      
      // Create preview URLs for the new files
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prevUrls => {
        // Revoke old URLs to prevent memory leaks
        prevUrls.forEach(url => URL.revokeObjectURL(url));
        return urls;
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setPreviewUrls(prevUrls => {
      const newUrls = [...prevUrls];
      URL.revokeObjectURL(newUrls[index]);
      newUrls.splice(index, 1);
      return newUrls;
    });
    setNewFiles(prevFiles => {
      const newFilesList = [...prevFiles];
      newFilesList.splice(index, 1);
      return newFilesList;
    });
  };

  useEffect(() => {
    // Cleanup URLs when component unmounts
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedItem = await updateMenuItem(
        item.id,
        formData,
        newFiles.length > 0 ? newFiles : null,
        imageFiles
      );

      toast({
        title: "Success",
        description: "Item updated successfully",
      });
      
      // Call onItemUpdated with the updated item
      onItemUpdated(updatedItem);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}    
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-20"
              />
            </div>
            <div className="space-y-2">
              <Label>Add-ons (one per line)</Label>
              <Textarea
                id="addons"
                className="h-24"
                value={formData.addons?.join('\n') || ''}
                onChange={(e) => {
                  const lines = e.target.value.split('\n');
                  setFormData(prev => ({ ...prev, addons: lines }));
                }}
                placeholder="Add Chicken +7&#10;Extra Sauce +1&#10;Add Avocado +3"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.is_vegan}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_vegan: !!checked })}
                />
                🌱 Vegan
              </Label>
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.is_vegetarian}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_vegetarian: !!checked })}
                />
                🥚 Vegetarian
              </Label>
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.is_spicy}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_spicy: !!checked })}
                />
                🌶️ Spicy
              </Label>
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.is_new}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_new: !!checked })}
                />
                ✨ New
              </Label>
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.is_limited_time}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_limited_time: !!checked })}
                />
                ⏳ Limited Time
              </Label>
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.is_most_popular}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_most_popular: !!checked })}
                />
                🔥 Popular
              </Label>
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.is_special}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_special: !!checked })}
                />
                ⭐ Special
              </Label>
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: !!checked })}
                />
                Available
              </Label>
            </div>
            <div className="space-y-2">
              <Label>Images</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imageFiles.map((url, index) => (
                  <div key={url} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`Existing ${index + 1}`}
                      className="object-cover rounded-lg w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFiles(prev => {
                          const newUrls = [...prev];
                          newUrls.splice(index, 1);
                          return newUrls;
                        });
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    multiple
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
                    <Plus className="w-8 h-8" />
                    <span className="text-xs">Upload Images</span>
                  </div>
                </label>
                {previewUrls.map((url, index) => (
                  <div key={url} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="object-cover rounded-lg w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}