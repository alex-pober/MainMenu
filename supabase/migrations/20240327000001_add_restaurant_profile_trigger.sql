-- Function to automatically create restaurant profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.restaurant_profiles (user_id, name)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create restaurant profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
