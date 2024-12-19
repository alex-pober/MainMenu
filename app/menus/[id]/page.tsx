'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MenuTabs } from '@/components/public/menus/menu-tabs';
import { DotPattern } from '@/components/ui/dot-pattern';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { MenuItem } from '@/lib/types';

interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  menu_items: MenuItem[];
}

interface Menu {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: string;
  is_always_available: boolean;
  available_start_time: string | null;
  available_end_time: string | null;
  display_order: number;
  menu_categories: MenuCategory[];
}

interface RestaurantProfile {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  banner_image_url: string | null;
  logo_image_url: string | null;
  business_hours: any;
  social_media: any;
}

interface InitialData {
  profile: RestaurantProfile;
  menu: Menu;
}

export default function MenuPage({ initialData }: { initialData: InitialData }) {
  const [menu, setMenu] = useState<Menu>(initialData.menu);
  const [profile, setProfile] = useState<RestaurantProfile>(initialData.profile);
  const { toast } = useToast();

  if (!profile || !menu) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfdff]" suppressHydrationWarning>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-1">
          {profile?.banner_image_url ? (
            <div className="relative">
              <div className="w-full py-4 sm:py-6 flex items-center justify-center">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative w-full max-w-[430px] sm:max-w-[430px] mx-auto px-2"
                >
                  <div className="relative aspect-[430/200]">
                    <Image 
                      src={profile.banner_image_url} 
                      alt={profile.name}
                      fill
                      sizes="(max-width: 430px) 100vw, 430px"
                      priority
                      className="object-contain w-full h-full"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="relative py-16 sm:py-24 text-center w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background ">
              <DotPattern 
                className={cn(
                  "[mask-image:radial-gradient(300px_80px_ellipse_at_center,white,transparent)]"
                )}
              />
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900"
              >
                {profile?.name}
              </motion.h1>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 lg:px-8 space-y-6">
          <MenuTabs userId={profile.user_id} />
        </div>
      </motion.div>
    </div>
  );
}
