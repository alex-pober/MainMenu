// @ts-nocheck
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Clock, Pencil, Trash, Power, GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSupabase } from '@/hooks/use-supabase';
import { useMenus } from '@/lib/context/menu-context';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { EditMenuDialog } from './edit-menu-dialog';
import { CreateMenuDialog } from './create-menu-dialog';
import { Menu } from '@/lib/types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface MenuListProps {
  searchQuery: string;
}

export function MenuList({ searchQuery }: MenuListProps) {
  const router = useRouter();
  const { menus, setMenus } = useMenus();
  const { toast } = useToast();
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { client: supabase, user, isLoading: isSessionLoading } = useSupabase();

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !supabase || !user) return;

    console.log('Drag end result:', {
      source: result.source,
      destination: result.destination,
      draggableId: result.draggableId
    });

    const items = Array.from(menus);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the display_order of all affected items
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index,
    }));

    setMenus(updatedItems);

    try {
      // Update each menu's display_order in the database
      for (const item of updatedItems) {
        const { error } = await supabase
          .from('menus')
          .update({ display_order: item.display_order })
          .eq('id', item.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating menu order:', error);
      toast({
        title: "Error",
        description: "Failed to update menu order",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (menuId: string, currentStatus: string) => {
    if (!supabase || !user) return;

    try {
      // Modify the status logic to match the allowed types
      const newStatus = currentStatus === 'active' ? 'draft' : 'active';
      const { data, error } = await supabase
        .from('menus')
        .update({ status: newStatus })
        .eq('id', menuId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update the menus state with the new status
      setMenus(menus.map(menu => 
        menu.id === menuId ? { ...menu, status: newStatus } : menu
      ));

      toast({
        title: "Success",
        description: `Menu is now ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (!supabase || !user) return;

    try {
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', menuId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update the local state
      setMenus(menus.filter(menu => menu.id !== menuId));

      toast({
        title: "Success",
        description: "Menu deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchMenus = async () => {
      // Wait for session loading to complete
      if (isSessionLoading) {
        return;
      }

      // Check if we have the required client and user
      if (!supabase || !user) {
        console.error('No session found');
        toast({
          title: "Authentication Error",
          description: "Please sign in to view your menus",
          variant: "destructive",
        });
        router.push('/auth');
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('menus')
          .select(`
            id,
            user_id,
            name,
            description,
            status,
            display_order,
            is_always_available,
            available_start_time,
            available_end_time,
            created_at,
            updated_at,
            menu_categories (
              id,
              name,
              description,
              sort_order,
              menu_items (
                id,
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
              )
            )
          `)
          .eq('user_id', user.id)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setMenus(data || []);
      } catch (error) {
        console.error('Error fetching menus:', error);
        toast({
          title: "Error",
          description: "Failed to fetch menus",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenus();
  }, [supabase, user, setMenus, toast, router, isSessionLoading]);

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 animate-spin" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 animate-spin" />
          <p>Loading menus...</p>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="menus">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {menus.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No menus created yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first menu. You can add categories, items, and customize your menu layout.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Menu
                  </Button>
                </CardContent>
              </Card>
            ) : menus
              .filter((menu) => {
                const searchLower = searchQuery.toLowerCase();

                // Search in menu name and description
                if (menu.name.toLowerCase().includes(searchLower) ||
                    (menu.description || '').toLowerCase().includes(searchLower)) {
                  return true;
                }
                
                // Search in categories and their items
                const hasMatch = menu.menu_categories?.some(category => {

                  // Search in category name and description
                  if (category.name.toLowerCase().includes(searchLower) ||
                      (category.description || '').toLowerCase().includes(searchLower)) {
                    return true;
                  }
                  
                  // Search in menu items
                  const itemMatch = category.menu_items?.some(item => {
                    return item.name.toLowerCase().includes(searchLower) ||
                           (item.description || '').toLowerCase().includes(searchLower);
                  });
                  
                  return itemMatch;
                });
                
                return hasMatch || false;
              })
              .map((menu, index) => (
                <Draggable key={menu.id} draggableId={menu.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      onClick={() => router.push(`/dashboard/menus/${menu.id}`)}
                      className="cursor-pointer"
                    >
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <div className="flex items-center space-x-2">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-medium">
                                {menu.name}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Last updated{" "}
                                {formatDistanceToNow(new Date(menu.updated_at), {
                                  addSuffix: true,
                                })}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMenu(menu);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Menu
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleStatus(menu.id, menu.status);
                                  }}
                                >
                                  <Power className="mr-2 h-4 w-4" />
                                  {menu.status === 'active' ? 'Deactivate Menu' : 'Activate Menu'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMenu(menu.id);
                                  }}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete Menu
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-sm text-muted-foreground">
                              {menu.description}
                            </div>
                            <Badge variant={menu.status === "active" ? "default" : "secondary"}>
                              {menu.status}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-2 h-4 w-4" />
                            Updated {formatDistanceToNow(new Date(menu.updated_at), { addSuffix: true })}
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
      {selectedMenu && (
        <EditMenuDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          menu={selectedMenu}
        />
      )}
      <CreateMenuDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </DragDropContext>
  );
}