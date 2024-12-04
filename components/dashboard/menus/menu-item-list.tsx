// @ts-nocheck
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditItemDialog } from './edit-item-dialog';
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { deleteImage } from '@/lib/utils/upload';
import type { MenuItem } from '@/lib/types';

interface MenuItemListProps {
  categoryId: string;
  searchQuery: string;
  items: MenuItem[];
  onItemsChange: (items: MenuItem[]) => void;
}

export function MenuItemList({ categoryId, searchQuery, items, onItemsChange }: MenuItemListProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('category_id', categoryId)
          .order('sort_order');

        if (error) throw error;
        onItemsChange(data.map(item => ({
          ...item,
          image_urls: item.image_urls || []
        })));
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchItems();
  }, [categoryId]);

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update({ is_available: !item.is_available })
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;
      
      onItemsChange(items.map(i => i.id === item.id ? {
        ...data,
        image_urls: data.image_urls || []
      } : i));
      
      toast({
        title: "Success",
        description: `Item ${data.is_available ? 'available' : 'unavailable'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    try {
      if (item.image_urls?.length > 0) {
        await Promise.all(item.image_urls.map(url => deleteImage(url)));
      }

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
      
      onItemsChange(items.filter(i => i.id !== item.id));
      
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleItemUpdated = (updatedItem: MenuItem) => {
    onItemsChange(items.map(item => 
      item.id === updatedItem.id ? {
        ...updatedItem,
        image_urls: updatedItem.image_urls || []
      } : item
    ));
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {filteredItems.map((item) => (
        <Card key={item.id} className="group transition-all duration-200 hover:shadow-md bg-card/50">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:text-primary">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setSelectedItem(item);
                    setIsEditDialogOpen(true);
                  }}>
                    Edit Item
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggleAvailability(item)}>
                    {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteItem(item)}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete Item
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold">${item.price.toFixed(2)}</div>
              <Badge variant={item.is_available ? "default" : "secondary"}>
                {item.is_available ? 'Available' : 'Unavailable'}
              </Badge>
            </div>

            {Array.isArray(item.image_urls) && item.image_urls.length > 0 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                {item.image_urls.map((url) => (
                  <Button
                    key={url}
                    variant="outline"
                    className="p-0 h-16 w-16 relative overflow-hidden"
                    onClick={() => setSelectedImage(url)}
                  >
                    <Image
                      src={url}
                      alt={`${item.name} preview`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </Button>
                ))}
              </div>
            )}

            {Array.isArray(item.dietary_info) && item.dietary_info.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.dietary_info.map((info) => (
                  <Badge key={info} variant="outline" className="text-xs">
                    {info}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {selectedItem && (
        <EditItemDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          item={selectedItem}
          onItemUpdated={handleItemUpdated}
        />
      )}

      {selectedImage && (
        <ImagePreviewDialog
          open={!!selectedImage}
          onOpenChange={() => setSelectedImage(null)}
          imageUrl={selectedImage}
        />
      )}
    </div>
  );
}