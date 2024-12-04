-- Enable storage by creating the storage schema if it doesn't exist
create schema if not exists storage;

-- Create the storage.buckets table if it doesn't exist
create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  owner uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  public boolean default false,
  avif_autodetection boolean default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

-- Create the storage.objects table if it doesn't exist
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text,
  owner uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_accessed_at timestamptz default now(),
  metadata jsonb,
  path_tokens text[] generated always as (string_to_array(name, '/')) stored
);

-- Enable RLS
alter table storage.buckets enable row level security;
alter table storage.objects enable row level security;

-- Create menu-item-pictures bucket if it doesn't exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-item-pictures',
  'menu-item-pictures',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/gif']
) on conflict (id) do nothing;

-- Policies for storage.buckets
create policy "Public buckets are viewable by everyone"
  on storage.buckets for select
  using (public = true);

create policy "Users can create buckets"
  on storage.buckets for insert
  with check (auth.role() = 'authenticated');

create policy "Owner can update their buckets"
  on storage.buckets for update
  using (auth.uid() = owner);

-- Policies for storage.objects
create policy "Public read access"
  on storage.objects for select
  using (bucket_id = 'menu-item-pictures');

create policy "Authenticated users can upload files to their folder"
  on storage.objects for insert
  with check (
    bucket_id = 'menu-item-pictures' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Authenticated users can update their files"
  on storage.objects for update
  using (
    bucket_id = 'menu-item-pictures' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Authenticated users can delete their files"
  on storage.objects for delete
  using (
    bucket_id = 'menu-item-pictures' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create storage.foldername function if it doesn't exist
create or replace function storage.foldername(name text)
returns text[] language plpgsql as $$
begin
  return string_to_array(name, '/');
end $$;