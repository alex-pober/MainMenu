// @ts-nocheck
import { supabase } from '../supabase';
import { Menu, MenuCategory, MenuItem } from '../types';
import * as db from './database';

export async function getMenuDetails(menuId: string): Promise<{
  menu: Menu;
  categories: MenuCategory[];
}> {
  try {
    const [menu, categories] = await Promise.all([
      db.getMenu(menuId),
      db.getMenuCategories(menuId)
    ]);

    return { menu, categories };
  } catch (error) {
    console.error('Error fetching menu details:', error);
    throw error;
  }
}

export async function getCategoryWithItems(categoryId: string): Promise<{
  category: MenuCategory;
  items: MenuItem[];
}> {
  try {
    const { data: category, error: categoryError } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (categoryError) throw categoryError;
    if (!category) throw new Error('Category not found');

    const items = await db.getMenuItems(categoryId);

    return { category, items };
  } catch (error) {
    console.error('Error fetching category with items:', error);
    throw error;
  }
}