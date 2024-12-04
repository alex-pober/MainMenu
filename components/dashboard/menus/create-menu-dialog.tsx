// @ts-nocheck
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';
import { useMenus } from '@/lib/context/menu-context';
import type { CreateMenuInput } from '@/lib/types';

interface CreateMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateMenuDialog({ open, onOpenChange }: CreateMenuDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateMenuInput>({
    name: '',
    description: '',
    status: 'draft',
    is_always_available: true,
    available_start_time: '00:00',
    available_end_time: '23:59'
  });
  const { toast } = useToast();
  const { addMenu } = useMenus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('You must be logged in to create a menu');
      }

      const { data, error } = await supabase
        .from('menus')
        .insert([
          {
            ...formData,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Add the new menu to the context
      addMenu(data);

      toast({
        title: "Success",
        description: "Menu created successfully",
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        status: 'draft',
        is_always_available: true,
        available_start_time: '00:00',
        available_end_time: '23:59'
      });
      
      onOpenChange(false);
    } catch (error: any) {
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
          <DialogTitle>Create New Menu</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Menu Name</Label>
              <Input
                id="name"
                placeholder="Enter menu name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter menu description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="availability">Always Available</Label>
              <Switch
                id="availability"
                checked={formData.is_always_available}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_always_available: checked })
                }
              />
            </div>
            {!formData.is_always_available && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-time">Available From</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={formData.available_start_time}
                    onChange={(e) => 
                      setFormData({ ...formData, available_start_time: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-time">Available Until</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={formData.available_end_time}
                    onChange={(e) => 
                      setFormData({ ...formData, available_end_time: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            )}
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
              {isLoading ? "Creating..." : "Create Menu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}