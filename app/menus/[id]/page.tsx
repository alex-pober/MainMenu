'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useSupabase } from '@/hooks/use-supabase';
import { useToast } from '@/hooks/use-toast';
import { MenuTabs } from '@/components/public/menus/menu-tabs';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
}

interface Menu {
  id: string;
  name: string;
  description: string;
  items: MenuItem[];
}

export default function MenuPage() {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const { toast } = useToast();
  // @ts-ignore
  const { client: supabase, error: supabaseError } = useSupabase();
  const menuId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  useEffect(() => {
    if (!supabase || !menuId) return;

    const fetchMenu = async () => {
      try {
        const { data, error } = await supabase
          .from('menus')
          .select('*, items(*)')
          .eq('id', menuId)
          .single();

        if (error) throw error;

        setMenu(data);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load menu",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [menuId, supabase, toast]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (supabaseError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground">Unable to connect to menu service</p>
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Menu Not Found</h1>
          <p className="text-muted-foreground">The menu you&apos;re looking for doesn&apos;t exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {menu.name}
          </h1>
          {menu.description && (
            <p className="mt-4 text-xl text-muted-foreground">
              {menu.description}
            </p>
          )}
        </div>

        <div className="space-y-12">
          <MenuTabs userId={menuId} />
        </div>
      </motion.div>
    </div>
  );
}
