// @ts-nocheck
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from '@/hooks/use-supabase';
import { uploadImages } from '@/lib/utils/upload';
import type { CreateMenuItemInput, MenuItem } from '@/lib/types';

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  onItemCreated: (item: MenuItem) => void;
}

export function CreateItemDialog({ 
  open, 
  onOpenChange, 
  categoryId,
  onItemCreated 
}: CreateItemDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { client: supabase } = useSupabase();
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    category_id: categoryId,
    name: '',
    description: '',
    price: null,
    is_available: true,
    is_spicy: false,
    is_new: false,
    is_limited_time: false,
    is_most_popular: false,
    is_special: false,
    is_vegan: false,
    is_vegetarian: false,
    image_urls: [],
    sort_order: 0,
    addons: []
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Get the current highest sort order
      const { data: existingItems } = await supabase
        .from('menu_items')
        .select('sort_order')
        .eq('category_id', categoryId)
        .order('sort_order', { ascending: false })
        .limit(1);

      const nextSortOrder = existingItems && existingItems.length > 0 
        ? existingItems[0].sort_order + 1 
        : 0;

      console.log('Starting item creation with images:', imageFiles.length);
      let uploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        uploadedUrls = await uploadImages(imageFiles);
        console.log('Successfully uploaded images:', uploadedUrls);
      }

      const { data, error } = await supabase
        .from('menu_items')
        .insert([{ ...formData, image_urls: uploadedUrls, sort_order: nextSortOrder }])
        .select()
        .single();

      if (error) {
        console.error('Error creating menu item:', error);
        throw error;
      }

      onItemCreated(data);
      toast({
        title: "Success",
        description: "Item created successfully",
      });

      // Reset form
      setFormData({
        category_id: categoryId,
        name: '',
        description: '',
        price: null,
        is_available: true,
        is_spicy: false,
        is_new: false,
        is_limited_time: false,
        is_most_popular: false,
        is_special: false,
        is_vegan: false,
        is_vegetarian: false,
        image_urls: [],
        sort_order: 0,
        addons: []
      });
      setImageFiles([]);
      setPreviewUrls([]);
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
      
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
    setImageFiles(prevFiles => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Item</DialogTitle>
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
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : null })}
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
              Create Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}