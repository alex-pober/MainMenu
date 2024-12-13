-- Add addons column to menu_items table
alter table menu_items 
add column if not exists addons text[] default null;

comment on column menu_items.addons is 'Optional array of add-on text descriptions for the menu item. Example: ["Add Chicken +7", "Extra Sauce +1"]';
