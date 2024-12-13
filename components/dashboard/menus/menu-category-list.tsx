// @ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, ChevronDown, ChevronRight, GripVertical, ChevronUp } from 'lucide-react';
import { MenuItemList } from './menu-item-list';
import { CreateItemDialog } from './create-item-dialog';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/hooks/use-toast';
import type { MenuCategory, MenuItem } from '@/lib/types';
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface MenuCategoryListProps {
  categories: MenuCategory[];
  setCategories: (categories: MenuCategory[]) => void;
  searchQuery: string;
}

export function MenuCategoryList({ categories, setCategories, searchQuery }: MenuCategoryListProps) {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [isCreateItemDialogOpen, setIsCreateItemDialogOpen] = useState(false);
  const [isRenameCategoryDialogOpen, setIsRenameCategoryDialogOpen] = useState(false);
  const [categoryToRename, setCategoryToRename] = useState<MenuCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [categoryItems, setCategoryItems] = useState<Record<string, MenuItem[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Fetch items for all categories when component mounts or categories change
  useEffect(() => {
    const fetchItemsForCategories = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .in('category_id', categories.map(c => c.id))
          .order('sort_order');

        if (error) throw error;

        // Group items by category
        const itemsByCategory = data.reduce((acc: Record<string, MenuItem[]>, item) => {
          if (!acc[item.category_id]) {
            acc[item.category_id] = [];
          }
          acc[item.category_id].push(item);
          return acc;
        }, {});

        setCategoryItems(itemsByCategory);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    if (categories.length > 0) {
      fetchItemsForCategories();
    }
  }, [categories]);

  // Initialize expanded state for all categories
  useEffect(() => {
    const initialExpandedState = categories.reduce((acc, category) => ({
      ...acc,
      [category.id]: false // Start collapsed by default
    }), {});
    setExpandedCategories(initialExpandedState);
  }, []);  // Only run on mount, removed categories dependency

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the sort_order of all affected items
    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index,
    }));

    // Preserve the current expanded states exactly as they are
    const currentExpandedState = { ...expandedCategories };

    setCategories(updatedItems);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Update each category's sort_order in the database
      for (const item of updatedItems) {
        const { error } = await supabase
          .from('menu_categories')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Category order updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(categories.filter(category => category.id !== categoryId));
      
      // Remove items for the deleted category
      const newCategoryItems = { ...categoryItems };
      delete newCategoryItems[categoryId];
      setCategoryItems(newCategoryItems);

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleItemCreated = (categoryId: string, newItem: MenuItem) => {
    setCategoryItems(prevItems => ({
      ...prevItems,
      [categoryId]: [...(prevItems[categoryId] || []), newItem].sort((a, b) => a.sort_order - b.sort_order)
    }));
  };

  const handleItemsUpdated = (categoryId: string, items: MenuItem[]) => {
    setCategoryItems(prevItems => ({
      ...prevItems,
      [categoryId]: items.sort((a, b) => a.sort_order - b.sort_order)
    }));
  };

  const handleExpandAll = () => {
    const newExpandedState = categories.reduce((acc, category) => ({
      ...acc,
      [category.id]: true
    }), {});
    setExpandedCategories(newExpandedState);
  };

  const handleCollapseAll = () => {
    const newExpandedState = categories.reduce((acc, category) => ({
      ...acc,
      [category.id]: false
    }), {});
    setExpandedCategories(newExpandedState);
  };

  const handleRenameCategory = async (categoryId: string) => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase
        .from('menu_categories')
        .update({
          name: newCategoryName,
          description: newCategoryDescription
        })
        .eq('id', categoryId);

      if (error) throw error;

      // Update local state
      setCategories(categories.map(cat => 
        cat.id === categoryId ? { 
          ...cat, 
          name: newCategoryName,
          description: newCategoryDescription 
        } : cat
      ));

      toast({
        title: "Success",
        description: "Category updated successfully",
      });

      // Reset state
      setIsRenameCategoryDialogOpen(false);
      setCategoryToRename(null);
      setNewCategoryName("");
      setNewCategoryDescription("");
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
    }
  };

  const filteredCategories = categories.filter(category => {
    const categoryMatch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (categoryMatch) return true;
    
    // Search through items in this category
    const items = categoryItems[category.id] || [];
    return items.some(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExpandAll}
            className="text-xs"
          >
            <ChevronDown className="mr-1 h-3 w-3" />
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCollapseAll}
            className="text-xs"
          >
            <ChevronUp className="mr-1 h-3 w-3" />
            Collapse All
          </Button>
        </div>
        <Droppable droppableId="categories">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-8">
              {filteredCategories.map((category, index) => (
                <Draggable key={category.id} draggableId={category.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="group"
                    >
                      <Card className="bg-gradient-to-r from-background to-muted border-l-4 border-l-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <div className="flex items-center space-x-3">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setExpandedCategories(prev => ({
                                ...prev,
                                [category.id]: !prev[category.id]
                              }))}
                              className="hover:text-primary"
                            >
                              {expandedCategories[category.id] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            <div className="space-y-1">
                              <CardTitle className="text-xl">
                                {category.name}
                              </CardTitle>
                              {category.description && (
                                <p className="text-sm text-muted-foreground">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCategory(category);
                                setIsCreateItemDialogOpen(true);
                              }}
                              className="transition-all hover:border-primary hover:text-primary"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Item
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:text-primary">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setCategoryToRename(category);
                                    setNewCategoryName(category.name);
                                    setNewCategoryDescription(category.description || '');
                                    setIsRenameCategoryDialogOpen(true);
                                  }}
                                >
                                  Edit Category
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className={cn(
                          "grid transition-all",
                          expandedCategories[category.id] ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        )}>
                          <div className="overflow-hidden">
                            <MenuItemList 
                              categoryId={category.id} 
                              searchQuery={searchQuery}
                              items={categoryItems[category.id] || []}
                              onItemsChange={(items) => handleItemsUpdated(category.id, items)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
        {selectedCategory && (
          <CreateItemDialog
            open={isCreateItemDialogOpen}
            onOpenChange={setIsCreateItemDialogOpen}
            categoryId={selectedCategory.id}
            onItemCreated={(newItem) => handleItemCreated(selectedCategory.id, newItem)}
          />
        )}
        {/* Rename Category Dialog */}
        <Dialog open={isRenameCategoryDialogOpen} onOpenChange={setIsRenameCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (categoryToRename) {
                handleRenameCategory(categoryToRename.id);
              }
            }}>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Input
                    id="categoryDescription"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Enter category description"
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setIsRenameCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DragDropContext>
  );
}