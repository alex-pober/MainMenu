"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MenuList } from '@/components/dashboard/menus/menu-list';
import { CreateMenuDialog } from '@/components/dashboard/menus/create-menu-dialog';
import { Breadcrumbs } from '@/components/ui/breadcrumb';
import { useSupabase } from '@/hooks/use-supabase';

export default function MenusPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const { client: supabase } = useSupabase();

  useEffect(() => {
    if (!supabase) return;
    
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }
      if (user) {
        setUserId(user.id);
      }
    };

    getUser();
  }, [supabase]);

  return (
    <div className="grid grid-cols-1 ">
      <div className="space-y-6">
        <Breadcrumbs
          segments={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Menus' },
          ]}
        />

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold ml-3">Menus</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Menu
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search menus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        <MenuList searchQuery={searchQuery} />
        <CreateMenuDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
      </div>
    </div>
  );
}