-- 1. Enable RLS
alter table products enable row level security;

-- 2. Create Profiles table for Roles (Admin vs Client)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text default 'client' check (role in ('client', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

-- 3. Policies for Profiles
-- Users can read their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- 4. Policies for Products
-- Everyone can read products
create policy "Public profiles are viewable by everyone" on products
  for select using (true);

-- Only Admins can insert/update/delete products
-- Note: This requires a join check or a claim. 
-- For simplicity in basic Supabase setups, we check the profiles table.
create policy "Admins can insert products" on products
  for insert with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins can update products" on products
  for update using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins can delete products" on products
  for delete using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- 5. Trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'client');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Helper to make the first user an admin (Optional, run manually if needed)
-- update profiles set role = 'admin' where email = 'your_email@example.com';
