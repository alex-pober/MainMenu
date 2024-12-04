// @ts-nocheck
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Clock, Pencil, Trash, Power, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from '@/lib/supabase';
import { useMenus } from '@/lib/context/menu-context';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { EditMenuDialog } from './edit-menu-dialog';
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

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

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

    console.log('Updated items with new order:', updatedItems.map(item => ({
      id: item.id,
      name: item.name,
      display_order: item.display_order
    })));

    setMenus(updatedItems);

    // Update the database
    try {
      // Update each menu's display_order one at a time
      for (const menu of updatedItems) {
        const { error } = await supabase
          .from('menus')
          .update({ display_order: menu.display_order })
          .eq('id', menu.id);

        if (error) {
          console.error('Supabase error details for menu', menu.id, ':', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
      }

      console.log('Database update successful');
      toast({
        title: "Success",
        description: "Menu order updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating menu order:', {
        error: error,
        message: error.message,
        details: error?.details,
        hint: error?.hint
      });
      toast({
        title: "Error",
        description: `Failed to update menu order: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (menuId: string, currentStatus: string) => {
    try {
      // Modify the status logic to match the allowed types
      const newStatus = currentStatus === 'active' ? 'draft' : 'active';
      const { data, error } = await supabase
        .from('menus')
        .update({ status: newStatus })
        .eq('id', menuId)
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
    try {
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', menuId);

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
      try {
        // Get the current user's session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error('No session found');
          return;
        }

        const { data, error } = await supabase
          .from('menus')
          .select(`
            *,
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
                dietary_info,
                allergens,
                sort_order
              )
            )
          `)
          .eq('user_id', session.user.id)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setMenus(data || []);
      } catch (error) {
        console.error('Error fetching menus:', error);
      }
    };

    fetchMenus();
  }, [setMenus]);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="menus">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {menus
              .filter((menu) =>
                menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                menu.description.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((menu, index) => (
                <Draggable key={menu.id} draggableId={menu.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
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
    </DragDropContext>
  );
}