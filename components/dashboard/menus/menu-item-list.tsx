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
import { MoreVertical, GripVertical } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/hooks/use-toast';
import { deleteImage } from '@/lib/utils/upload';
import type { MenuItem } from '@/lib/types';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

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

  const fetchItems = async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          category_id,
          name,
          description,
          price,
          image_urls,
          is_available,
          is_spicy,
          is_new,
          is_limited_time,
          is_most_popular,
          is_special,
          is_vegan,
          is_vegetarian,
          sort_order,
          created_at,
          updated_at
        `)
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

  useEffect(() => {
    fetchItems();
  }, [categoryId]);

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
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
      
      fetchItems();
      
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
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      if (item.image_urls?.length > 0) {
        await Promise.all(item.image_urls.map(url => deleteImage(url)));
      }

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
      
      // Get remaining items and update their sort order
      const remainingItems = items
        .filter(i => i.id !== item.id)
        .map((item, index) => ({
          ...item,
          sort_order: index
        }));

      // Update sort orders in database
      await Promise.all(
        remainingItems.map((item) =>
          supabase
            .from('menu_items')
            .update({ sort_order: item.sort_order })
            .eq('id', item.id)
        )
      );
      
      // Update local state
      onItemsChange(remainingItems);
      
      // Fetch fresh data
      fetchItems();
      
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

  const handleItemUpdated = async (updatedItem: MenuItem) => {
    // Update local state
    onItemsChange(items.map(i => i.id === updatedItem.id ? updatedItem : i));
    // Fetch fresh data
    await fetchItems();
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items_copy = Array.from(items);
    const [reorderedItem] = items_copy.splice(result.source.index, 1);
    items_copy.splice(result.destination.index, 0, reorderedItem);

    // Update sort_order for all affected items
    const updatedItems = items_copy.map((item, index) => ({
      ...item,
      sort_order: index
    }));

    onItemsChange(updatedItems);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Update all items with new sort_order
      await Promise.all(
        updatedItems.map((item) =>
          supabase
            .from('menu_items')
            .update({ sort_order: item.sort_order })
            .eq('id', item.id)
        )
      );

      toast({
        title: "Success",
        description: "Item order updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={categoryId}>
        {(provided) => (
          <div 
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="grid gap-4"
          >
            {filteredItems.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <Card className={`bg-card/50 hover:shadow-md ${snapshot.isDragging && "shadow-lg"}`}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          <div className="flex items-center gap-2 flex-1 min-w-0 w-full md:w-auto">
                            <GripVertical className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col flex-grow gap-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h3 className="font-medium">{item.name}</h3>
                                    {item.description && (
                                      <p className="text-sm text-muted-foreground">
                                        {item.description}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {item.is_vegan && (
                                        <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200">
                                          🌱 Vegan
                                        </Badge>
                                      )}
                                      {item.is_vegetarian && (
                                        <Badge variant="outline" className="text-xs bg-lime-100 text-lime-800 border-lime-200">
                                          🥚 Vegetarian
                                        </Badge>
                                      )}
                                      {item.is_spicy && (
                                        <Badge variant="outline" className="text-xs bg-red-100 text-red-800 border-red-200">
                                          🌶️ Spicy
                                        </Badge>
                                      )}
                                      {item.is_new && (
                                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                                          ✨ New
                                        </Badge>
                                      )}
                                      {item.is_limited_time && (
                                        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                                          ⏳ Limited Time
                                        </Badge>
                                      )}
                                      {item.is_most_popular && (
                                        <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                                          🔥 Most Popular
                                        </Badge>
                                      )}
                                      {item.is_special && (
                                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                                          ⭐ Special
                                        </Badge>
                                      )}
                                    </div>
                                    {item.addons && item.addons.length > 0 && (
                                      <div className="flex flex-col gap-1 mt-1">
                                        {item.addons.map((addon, index) => (
                                          addon.trim() && (
                                            <Badge key={index} variant="outline" className="text-xs w-fit">
                                              {addon}
                                            </Badge>
                                          )
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-row md:flex-col items-start md:items-end gap-2 w-full md:w-auto">
                            <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                              {Array.isArray(item.image_urls) && item.image_urls.length > 0 && (
                                <div className="flex gap-2 order-3 md:order-none">
                                  {item.image_urls.map((url) => (
                                    <Button
                                      key={url}
                                      variant="outline"
                                      className="p-0 h-12 w-12 md:h-16 md:w-16 relative overflow-hidden"
                                      onClick={() => setSelectedImage(url)}
                                    >
                                      <Image
                                        src={url}
                                        alt={`${item.name} preview`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 48px, 64px"
                                      />
                                    </Button>
                                  ))}

                            
                              
                                </div>
                              )}
                              <div>
                                <div className="text-lg font-semibold order-1 md:order-none">{item.price !== null ? `$${item.price.toFixed(2)}` : <></>}</div>
                                <Badge variant={item.is_available ? "default" : "secondary"} className="order-2 md:order-none">
                                  {item.is_available ? 'Available' : 'Unavailable'}
                                </Badge>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="hover:text-primary order-4 md:order-none">
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
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
    </DragDropContext>
  );
}