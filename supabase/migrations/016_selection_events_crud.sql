-- Add prize field to selections table
alter table public.selections add column if not exists prize text;

-- Admin policies for selections
create policy "Admins can manage selections select" on public.selections
  for select using (public.is_admin());

create policy "Admins can manage selections insert" on public.selections
  for insert with check (public.is_admin());

create policy "Admins can manage selections update" on public.selections
  for update using (public.is_admin());

create policy "Admins can manage selections delete" on public.selections
  for delete using (public.is_admin());

-- Admin policy for selection_applications (view all)
create policy "Admins can view all selection applications" on public.selection_applications
  for select using (public.is_admin());

create policy "Admins can update selection applications" on public.selection_applications
  for update using (public.is_admin());
