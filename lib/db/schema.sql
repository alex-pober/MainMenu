-- Enable UUID extension
create extension if not exists "uuid-ossp";

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
  dietary_info jsonb default '[]'::jsonb not null,
  allergens jsonb default '[]'::jsonb not null,
  preparation_time interval,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create item_options table
create table if not exists item_options (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references menu_items(id) on delete cascade not null,
  name text not null,
  description text,
  price_modifier decimal(10,2) default 0 not null,
  is_required boolean default false not null,
  max_selections integer default 1 not null,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table item_options enable row level security;

-- Create policies for menu_categories
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

-- Create policies for menu_items
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

-- Create policies for item_options
create policy "Users can view their item options"
  on item_options for select
  using (exists (
    select 1 from menu_items
    join menu_categories on menu_categories.id = menu_items.category_id
    join menus on menus.id = menu_categories.menu_id
    where menu_items.id = item_options.item_id
    and menus.user_id = auth.uid()
  ));

create policy "Users can insert their item options"
  on item_options for insert
  with check (exists (
    select 1 from menu_items
    join menu_categories on menu_categories.id = menu_items.category_id
    join menus on menus.id = menu_categories.menu_id
    where menu_items.id = item_options.item_id
    and menus.user_id = auth.uid()
  ));

create policy "Users can update their item options"
  on item_options for update
  using (exists (
    select 1 from menu_items
    join menu_categories on menu_categories.id = menu_items.category_id
    join menus on menus.id = menu_categories.menu_id
    where menu_items.id = item_options.item_id
    and menus.user_id = auth.uid()
  ));

create policy "Users can delete their item options"
  on item_options for delete
  using (exists (
    select 1 from menu_items
    join menu_categories on menu_categories.id = menu_items.category_id
    join menus on menus.id = menu_categories.menu_id
    where menu_items.id = item_options.item_id
    and menus.user_id = auth.uid()
  ));

-- Create triggers for updated_at
create trigger update_menu_categories_updated_at
  before update on menu_categories
  for each row
  execute function update_updated_at_column();

create trigger update_menu_items_updated_at
  before update on menu_items
  for each row
  execute function update_updated_at_column();

create trigger update_item_options_updated_at
  before update on item_options
  for each row
  execute function update_updated_at_column();