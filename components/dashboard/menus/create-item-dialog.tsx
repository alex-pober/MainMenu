// @ts-nocheck
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { useToast } from "@/hooks/use-toast";
import { createBrowserClient } from '@supabase/ssr';
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
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    category_id: categoryId,
    name: '',
    description: '',
    price: 0,
    is_available: true,
    is_spicy: false,
    is_new: false,
    is_limited_time: false,
    is_most_popular: false,
    is_special: false,
    is_vegan: false,
    is_vegetarian: false,
    image_urls: [],
    sort_order: 0
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

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
        price: 0,
        is_available: true,
        is_spicy: false,
        is_new: false,
        is_limited_time: false,
        is_most_popular: false,
        is_special: false,
        is_vegan: false,
        is_vegetarian: false,
        image_urls: [],
        sort_order: 0
      });
      setImageFiles([]);
      
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Item Name</Label>
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
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Images</Label>
              <MultiImageUpload
                value={imageFiles}
                onChange={setImageFiles}
                onRemove={(index) => {
                  setImageFiles(prev => prev.filter((_, i) => i !== index));
                }}
              />
              <div className="text-xs text-muted-foreground">
                Upload up to 5 images. Supported formats: JPEG, PNG, WebP. Max size: 5MB each.
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="is_available">Availability</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, is_available: checked as boolean })
                  }
                />
                <label
                  htmlFor="is_available"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Available
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <Label>Item Labels</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_spicy"
                    checked={formData.is_spicy}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_spicy: checked as boolean })
                    }
                  />
                  <label htmlFor="is_spicy" className="text-sm">Spicy</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_new"
                    checked={formData.is_new}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_new: checked as boolean })
                    }
                  />
                  <label htmlFor="is_new" className="text-sm">New Item</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_limited_time"
                    checked={formData.is_limited_time}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_limited_time: checked as boolean })
                    }
                  />
                  <label htmlFor="is_limited_time" className="text-sm">Limited Time</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_most_popular"
                    checked={formData.is_most_popular}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_most_popular: checked as boolean })
                    }
                  />
                  <label htmlFor="is_most_popular" className="text-sm">Most Popular</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_special"
                    checked={formData.is_special}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_special: checked as boolean })
                    }
                  />
                  <label htmlFor="is_special" className="text-sm">Special</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_vegan"
                    checked={formData.is_vegan}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_vegan: checked as boolean })
                    }
                  />
                  <label htmlFor="is_vegan" className="text-sm">Vegan</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_vegetarian"
                    checked={formData.is_vegetarian}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_vegetarian: checked as boolean })
                    }
                  />
                  <label htmlFor="is_vegetarian" className="text-sm">Vegetarian</label>
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
              {isLoading ? "Creating..." : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}