-- ============================================
-- PROMOS IMPROVEMENTS
-- ============================================

-- New columns on promos
alter table public.promos
  add column if not exists cover_image_path text,
  add column if not exists original_price decimal(10,2),
  add column if not exists whatsapp_number text;

-- booking_token for identifying each reservation
alter table public.promo_bookings
  add column if not exists booking_token text unique not null default gen_random_uuid()::text;

-- ============================================
-- STORAGE BUCKET
-- ============================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'promo-covers',
  'promo-covers',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Allow admins to upload/delete in promo-covers
create policy "Admins can manage promo covers" on storage.objects
  for all using (
    bucket_id = 'promo-covers'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Allow public read of promo covers (bucket is public, but policy required for auth checks)
create policy "Public can view promo covers" on storage.objects
  for select using (bucket_id = 'promo-covers');

-- ============================================
-- ADMIN RLS POLICIES
-- ============================================
create policy "Admins can manage promos" on public.promos
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can view all promo bookings" on public.promo_bookings
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update promo bookings" on public.promo_bookings
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================
-- RPC: atomic slot reservation
-- Increments slots_taken only if promo is active and has availability.
-- Also flips status to sold_out when the last slot is taken.
-- Returns TRUE if the slot was successfully reserved, FALSE otherwise.
-- ============================================
create or replace function public.reserve_promo_slot(p_promo_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  v_updated int;
begin
  update public.promos
  set
    slots_taken = slots_taken + 1,
    status = case
      when slots_taken + 1 >= max_slots then 'sold_out'
      else status
    end
  where id = p_promo_id
    and status = 'active'
    and slots_taken < max_slots;

  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_promo_bookings_token on public.promo_bookings(booking_token);
create index if not exists idx_promo_bookings_promo on public.promo_bookings(promo_id);
