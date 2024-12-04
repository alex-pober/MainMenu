// @ts-nocheck

import { supabase } from '../supabase';
import { Menu, MenuCategory, MenuItem } from '../types';

export async function getMenu(menuId: string): Promise<Menu> {
  try {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('id', menuId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Menu not found');

    return data;
  } catch (error) {
    console.error('Error fetching menu:', error);
    throw error;
  }
}

export async function getMenuCategories(menuId: string): Promise<MenuCategory[]> {
  try {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('menu_id', menuId)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    throw error;
  }
}

export async function getMenuItems(categoryId: string): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
}