// @ts-nocheck

import { supabase } from '../supabase';
import type { Menu, MenuCategory, MenuItem } from '../types';

export async function getPublicMenus() {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('status', 'active')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getPublicMenuCategories(menuId: string) {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('menu_id', menuId)
    .order('sort_order');

  if (error) throw error;
  return data || [];
}

export async function getPublicMenuItems(categoryId: string) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_available', true)
    .order('sort_order');

  if (error) throw error;
  return data || [];
}