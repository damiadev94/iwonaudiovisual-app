-- ============================================
-- GLOBAL SETTINGS
-- Single key/value store for app-wide config
-- ============================================
create table public.settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

alter table public.settings enable row level security;

-- Only admins can read/write settings
create policy "Admins manage settings" on public.settings
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Seed default row
insert into public.settings (key, value) values ('whatsapp_link', null);

-- ============================================
-- Remove per-promo whatsapp_number (global now)
-- ============================================
alter table public.promos drop column if exists whatsapp_number;
