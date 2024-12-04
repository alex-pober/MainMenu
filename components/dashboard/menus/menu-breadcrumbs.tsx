"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui/breadcrumb';
import { supabase } from '@/lib/supabase';
import type { Menu } from '@/lib/types';

export function MenuBreadcrumbs() {
  const params = useParams();
  const [menu, setMenu] = useState<Menu | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!params.id) return;

      try {
          // @ts-ignore
        const { data, error } = await supabase
          .from('menus')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
          // @ts-ignore
        setMenu(data);
      } catch (error) {
        console.error('Error fetching menu:', error);
      }
    };

    fetchMenu();
  }, [params.id]);

  const segments = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Menus', href: '/dashboard/menus' },
  ];

  if (params.id && menu) {
    segments.push({ title: menu.name, href: `/menus/${params.id}` });
  }

  return <Breadcrumbs segments={segments} className="mb-6" />;
}