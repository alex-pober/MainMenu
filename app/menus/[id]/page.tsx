'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useSupabase } from '@/hooks/use-supabase';
import { useToast } from '@/hooks/use-toast';
import { MenuTabs } from '@/components/public/menus/menu-tabs';
import { DotPattern } from '@/components/ui/dot-pattern';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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

interface User {
  name: string;
  banner_image_url: string | null;
  user_id: string;
}

export default function MenuPage() {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const { toast } = useToast();
  const { client: supabase, error: supabaseError, isLoading: isSupabaseLoading } = useSupabase({ requireAuth: false });
  const userId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  useEffect(() => {
    // Reset loading state when dependencies change
    setIsLoading(true);
    
    if (supabaseError) {
      console.error('Supabase initialization error:', supabaseError);
      toast({
        title: 'Error',
        description: 'Failed to initialize database connection',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (isSupabaseLoading) {
      // Still initializing, wait for the next effect run
      return;
    }

    if (!userId) {
      console.error('No user ID provided in URL parameters');
      toast({
        title: 'Error',
        description: 'Invalid menu URL',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    console.log('Starting data fetch for user ID:', userId);
    
    const fetchData = async () => {
      try {
        console.log('Fetching restaurant profile...');
        // First fetch user info
        const { data: userData, error: userError } = await supabase
          .from('restaurant_profiles')
          .select('name, banner_image_url, user_id')
          .eq('user_id', userId)
          .single();

        if (userError) {
          console.error('Error fetching restaurant profile:', userError);
          toast({
            title: 'Error',
            description: 'Restaurant not found',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        console.log('Restaurant profile found:', userData);
        setUser(userData);

        console.log('Fetching menus for restaurant owner:', userData.user_id);
        // Then fetch menus using the restaurant owner's user_id
        const { data: userMenus, error: menuError } = await supabase
          .from('menus')
          .select(`
            *,
            menu_categories (
              *,
              menu_items (*)
            )
          `)
          .eq('user_id', userData.user_id)
          .order('created_at', { ascending: false });

        if (menuError) {
          console.error('Error fetching menus:', menuError);
          toast({
            title: 'Error',
            description: 'Failed to load menu data',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        if (!userMenus || userMenus.length === 0) {
          console.log('No menus found for restaurant owner:', userData.user_id);
          toast({
            title: 'No Menu Found',
            description: 'This restaurant has not created any menus yet',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        console.log('Menus fetched successfully:', userMenus.length, 'menus found');
        setMenu(userMenus[0]); // Set the first menu by default
      } catch (error) {
        console.error('Unexpected error while fetching data:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, supabase, toast, supabaseError, isSupabaseLoading]);

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
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-4">
          {user?.banner_image_url ? (
            <div className="relative">
              <div className="w-full py-4 sm:py-6 flex items-center justify-center">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative w-full max-w-[430px] sm:max-w-[430px] mx-auto px-2"
                >
                  <Image 
                    src={user.banner_image_url} 
                    alt={user.name}
                    layout="responsive"
                    width={430}
                    height={200}
                    objectFit="contain"
                    className="w-full h-auto"
                  />
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="relative py-16 sm:py-24 text-center w-full flex-col items-center justify-center overflow-hidden rounded-lg  bg-background md:shadow-xl">
                <DotPattern 
                  className={cn(
                    "[mask-image:radial-gradient(300px_80px_ellipse_at_center,white,transparent)]"
                  )}
                />
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900"
              >
                {user?.name}
              </motion.h1>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 lg:px-8 space-y-6">
          <MenuTabs userId={userId} />
        </div>
      </motion.div>
    </div>
  );
}
