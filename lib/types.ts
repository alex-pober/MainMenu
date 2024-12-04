// @ts-nocheck

export interface Menu {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'scheduled';
  is_always_available: boolean;
  available_start_time?: string;
  available_end_time?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface MenuCategory {
  id: string;
  menu_id: string;
  name: string;
  description?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  menu_items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_urls: string[];
  is_available: boolean;
  dietary_info: string[];
  allergens: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ItemOption {
  id: string;
  item_id: string;
  name: string;
  description?: string;
  price_modifier: number;
  is_required: boolean;
  max_selections: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CreateMenuInput = Omit<Menu, 'id' | 'created_at' | 'updated_at' | 'user_id'>;
export type CreateMenuCategoryInput = Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>;
export type CreateMenuItemInput = Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>;
export type CreateItemOptionInput = Omit<ItemOption, 'id' | 'created_at' | 'updated_at'>;