"use client";

import { createContext, useContext, useState, useCallback } from 'react';
import type { Menu } from '@/lib/types';

interface MenuContextType {
  menus: Menu[];
  setMenus: React.Dispatch<React.SetStateAction<Menu[]>>;
  addMenu: (menu: Menu) => void;
  updateMenu: (menu: Menu) => void;
  deleteMenu: (id: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menus, setMenus] = useState<Menu[]>([]);

  const addMenu = useCallback((menu: Menu) => {
    setMenus(current => [menu, ...current]);
  }, []);

  const updateMenu = useCallback((updatedMenu: Menu) => {
    setMenus(current =>
      current.map(menu =>
        menu.id === updatedMenu.id ? updatedMenu : menu
      )
    );
  }, []);

  const deleteMenu = useCallback((id: string) => {
    setMenus(current => current.filter(menu => menu.id !== id));
  }, []);

  return (
    <MenuContext.Provider value={{ menus, setMenus, addMenu, updateMenu, deleteMenu }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenus() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenus must be used within a MenuProvider');
  }
  return context;
}