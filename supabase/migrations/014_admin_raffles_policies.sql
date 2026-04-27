-- Allow admins to view all raffles (including drafts)
create policy "Admins can manage raffles select" on public.raffles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Allow admins to create raffles
create policy "Admins can manage raffles insert" on public.raffles
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Allow admins to update raffles
create policy "Admins can manage raffles update" on public.raffles
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Allow admins to delete raffles
create policy "Admins can manage raffles delete" on public.raffles
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Allow admins to manage all raffle entries (needed to read entries when picking winner)
create policy "Admins can manage raffle entries" on public.raffle_entries
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
