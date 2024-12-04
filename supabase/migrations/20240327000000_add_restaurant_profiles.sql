-- Create restaurant_profiles table
create table if not exists public.restaurant_profiles (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null unique,
    name text not null,
    description text,
    phone_number text,
    email text,
    website text,
    banner_image_url text,
    logo_image_url text,
    address_line1 text,
    address_line2 text,
    city text,
    state text,
    postal_code text,
    country text,
    business_hours jsonb default '{}'::jsonb,
    social_media jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.restaurant_profiles enable row level security;

-- Create policies
create policy "Users can view their own restaurant profile"
    on public.restaurant_profiles for select
    using (auth.uid() = user_id);

create policy "Public can view any restaurant profile"
    on public.restaurant_profiles for select
    using (true);

create policy "Users can create their restaurant profile"
    on public.restaurant_profiles for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own restaurant profile"
    on public.restaurant_profiles for update
    using (auth.uid() = user_id);

