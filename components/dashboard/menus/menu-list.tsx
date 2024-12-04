"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Clock, Pencil, Trash, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from '@/lib/supabase';
import { useMenus } from '@/lib/context/menu-context';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { EditMenuDialog } from './edit-menu-dialog';
import { Menu } from '@/lib/types';

interface MenuListProps {
  searchQuery: string;
}

export function MenuList({ searchQuery }: MenuListProps) {
  const router = useRouter();
  const { menus, setMenus } = useMenus();
  const { toast } = useToast();
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMenus(data || []);
      } catch (error) {
        console.error('Error fetching menus:', error);
      }
    };

    fetchMenus();
  }, [setMenus]);

  const filteredMenus = menus.filter(menu =>
    menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    menu.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredMenus.map((menu) => (
        <Card 
          key={menu.id} 
          className="cursor-pointer transition-all hover:shadow-md"
          onClick={() => router.push(`/dashboard/menus/${menu.id}`)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>{menu.name}</CardTitle>
              <CardDescription>
                {menu.is_always_available 
                  ? "Always Available"
                  : `Available ${menu.available_start_time} - ${menu.available_end_time}`
                }
              </CardDescription>
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
      ))}
      {selectedMenu && (
        <EditMenuDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          menu={selectedMenu}
        />
      )}
    </div>
  );
}