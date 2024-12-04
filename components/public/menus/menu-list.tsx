"use client";

import { useState } from 'react';
import { MenuCard } from './menu-card';
import type { Menu } from '@/lib/types';

interface MenuListProps {
  menus: Menu[];
}

export function MenuList({ menus }: MenuListProps) {
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {menus.map((menu) => (
        <MenuCard
          key={menu.id}
          menu={menu}
          isExpanded={expandedMenuId === menu.id}
          onToggle={() => setExpandedMenuId(
            expandedMenuId === menu.id ? null : menu.id
          )}
        />
      ))}
      
      {menus.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No menus found</p>
        </div>
      )}
    </div>
  );
}