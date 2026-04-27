-- SECURITY DEFINER bypasses RLS when querying profiles,
-- breaking the infinite recursion caused by policies that
-- check admin role by querying profiles (which itself has admin policies).
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

-- Fix: profiles (001_initial_schema)
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());

-- Fix: courses and lessons (006_admin_courses_policies)
drop policy if exists "Admins can manage courses" on public.courses;
create policy "Admins can manage courses" on public.courses
  for all using (public.is_admin());

drop policy if exists "Admins can manage lessons" on public.lessons;
create policy "Admins can manage lessons" on public.lessons
  for all using (public.is_admin());

-- Fix: raffles (014_admin_raffles_policies)
drop policy if exists "Admins can manage raffles select" on public.raffles;
drop policy if exists "Admins can manage raffles insert" on public.raffles;
drop policy if exists "Admins can manage raffles update" on public.raffles;
drop policy if exists "Admins can manage raffles delete" on public.raffles;
drop policy if exists "Admins can manage raffle entries" on public.raffle_entries;

create policy "Admins can manage raffles select" on public.raffles
  for select using (public.is_admin());

create policy "Admins can manage raffles insert" on public.raffles
  for insert with check (public.is_admin());

create policy "Admins can manage raffles update" on public.raffles
  for update using (public.is_admin());

create policy "Admins can manage raffles delete" on public.raffles
  for delete using (public.is_admin());

create policy "Admins can manage raffle entries" on public.raffle_entries
  for select using (public.is_admin());
