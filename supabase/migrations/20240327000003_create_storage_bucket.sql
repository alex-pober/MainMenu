-- Create a new storage bucket for restaurant images
insert into storage.buckets (id, name, public)
values ('restaurant-images', 'restaurant-images', true);

-- Allow authenticated users to upload images
create policy "Allow authenticated users to upload images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'restaurant-images'
  and auth.role() = 'authenticated'
);

-- Allow public access to view images
create policy "Allow public to view images"
on storage.objects for select
to public
using (bucket_id = 'restaurant-images');
