// @ts-nocheck
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';
import { uploadImages } from '@/lib/utils/upload';
import type { CreateMenuItemInput, MenuItem } from '@/lib/types';

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  onItemCreated: (item: MenuItem) => void;
}

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten Free' },
  { id: 'dairy-free', label: 'Dairy Free' }
];

export function CreateItemDialog({ 
  open, 
  onOpenChange, 
  categoryId,
  onItemCreated 
}: CreateItemDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateMenuItemInput>({
    category_id: categoryId,
    name: '',
    description: '',
    price: 0,
    is_available: true,
    dietary_info: [],
    allergens: [],
    image_urls: [],
    sort_order: 0
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Starting item creation with images:', imageFiles.length);
      let uploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        uploadedUrls = await uploadImages(imageFiles);
        console.log('Successfully uploaded images:', uploadedUrls);
      }

      const { data, error } = await supabase
        .from('menu_items')
        .insert([{ ...formData, image_urls: uploadedUrls }])
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
        dietary_info: [],
        allergens: [],
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

  const handleDietaryChange = (optionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      dietary_info: checked
        ? [...prev.dietary_info, optionId]
        : prev.dietary_info.filter(id => id !== optionId)
    }));
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
                      checked={formData.dietary_info.includes(option.id)}
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
              {isLoading ? "Creating..." : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}