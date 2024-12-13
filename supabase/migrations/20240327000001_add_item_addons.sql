-- Create item_addons table
create table if not exists item_addons (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references menu_items(id) on delete cascade not null,
  name text not null,
  price decimal(10,2) not null,
  is_available boolean default true not null,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table item_addons enable row level security;

-- Create policies for item_addons
create policy "Users can view item addons"
  on item_addons for select
  using (true);

create policy "Users can insert their item addons"
  on item_addons for insert
  with check (exists (
    select 1 from menu_items
    join menu_categories on menu_categories.id = menu_items.category_id
    join menus on menus.id = menu_categories.menu_id
    where menu_items.id = item_addons.item_id
    and menus.user_id = auth.uid()
  ));

create policy "Users can update their item addons"
  on item_addons for update
  using (exists (
    select 1 from menu_items
    join menu_categories on menu_categories.id = menu_items.category_id
    join menus on menus.id = menu_categories.menu_id
    where menu_items.id = item_addons.item_id
    and menus.user_id = auth.uid()
  ));

create policy "Users can delete their item addons"
  on item_addons for delete
  using (exists (
    select 1 from menu_items
    join menu_categories on menu_categories.id = menu_items.category_id
    join menus on menus.id = menu_categories.menu_id
    where menu_items.id = item_addons.item_id
    and menus.user_id = auth.uid()
  ));
