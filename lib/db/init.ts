import { supabase } from '../supabase';

const schema = `
-- Create menus table
create table if not exists menus (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null,
  description text,
  status text default 'draft' check (status in ('draft', 'active', 'scheduled')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create menu_categories table
create table if not exists menu_categories (
  id uuid default uuid_generate_v4() primary key,
  menu_id uuid references menus(id) on delete cascade not null,
  name text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create menu_items table
create table if not exists menu_items (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references menu_categories(id) on delete cascade not null,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  is_available boolean default true not null,
  dietary_info text[] default array[]::text[] not null,
  allergens text[] default array[]::text[] not null,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table menus enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;

-- Create policies
create policy "Users can view their own menus"
  on menus for select
  using (auth.uid() = user_id);

create policy "Users can insert their own menus"
  on menus for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own menus"
  on menus for update
  using (auth.uid() = user_id);

create policy "Users can delete their own menus"
  on menus for delete
  using (auth.uid() = user_id);

-- Categories policies
create policy "Users can view their menu categories"
  on menu_categories for select
  using (exists (
    select 1 from menus
    where menus.id = menu_categories.menu_id
    and menus.user_id = auth.uid()
  ));

create policy "Users can insert their menu categories"
  on menu_categories for insert
  with check (exists (
    select 1 from menus
    where menus.id = menu_categories.menu_id
    and menus.user_id = auth.uid()
  ));

create policy "Users can update their menu categories"
  on menu_categories for update
  using (exists (
    select 1 from menus
    where menus.id = menu_categories.menu_id
    and menus.user_id = auth.uid()
  ));

create policy "Users can delete their menu categories"
  on menu_categories for delete
  using (exists (
    select 1 from menus
    where menus.id = menu_categories.menu_id
    and menus.user_id = auth.uid()
  ));

-- Items policies
create policy "Users can view their menu items"
  on menu_items for select
  using (exists (
    select 1 from menu_categories
    join menus on menus.id = menu_categories.menu_id
    where menu_categories.id = menu_items.category_id
    and menus.user_id = auth.uid()
  ));

create policy "Users can insert their menu items"
  on menu_items for insert
  with check (exists (
    select 1 from menu_categories
    join menus on menus.id = menu_categories.menu_id
    where menu_categories.id = menu_items.category_id
    and menus.user_id = auth.uid()
  ));

create policy "Users can update their menu items"
  on menu_items for update
  using (exists (
    select 1 from menu_categories
    join menus on menus.id = menu_categories.menu_id
    where menu_categories.id = menu_items.category_id
    and menus.user_id = auth.uid()
  ));

create policy "Users can delete their menu items"
  on menu_items for delete
  using (exists (
    select 1 from menu_categories
    join menus on menus.id = menu_categories.menu_id
    where menu_categories.id = menu_items.category_id
    and menus.user_id = auth.uid()
  ));

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers
create trigger update_menus_updated_at
  before update on menus
  for each row
  execute function update_updated_at_column();

create trigger update_menu_categories_updated_at
  before update on menu_categories
  for each row
  execute function update_updated_at_column();

create trigger update_menu_items_updated_at
  before update on menu_items
  for each row
  execute function update_updated_at_column();
`;

export async function initializeDatabase() {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: schema });
    if (error) throw error;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}