-- ============================================
-- PROMOTIONS SYSTEM
-- Supersedes the is_free_access_period() approach from migration 020.
-- Adds a promotions table with typed access control and updates all
-- 5 content RLS policies to allow access via active promotions.
-- ============================================

-- ============================================
-- PROMOTION TYPE ENUM
-- ============================================
create type public.promotion_type as enum (
  'full_access',
  'courses',
  'raffles',
  'selections',
  'promos'
);

-- ============================================
-- PROMOTIONS TABLE
-- ============================================
create table public.promotions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        public.promotion_type not null default 'full_access',
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  is_active   boolean not null default true,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint valid_date_range check (ends_at > starts_at)
);

alter table public.promotions enable row level security;

-- ============================================
-- updated_at TRIGGER
-- Defined inline to avoid assuming update_updated_at() exists with the
-- right signature — the function from 001 is reused if still present,
-- but we redefine it here as create or replace to be safe.
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_promotions_updated_at
  before update on public.promotions
  for each row execute procedure public.update_updated_at();

-- ============================================
-- RLS POLICIES FOR PROMOTIONS
-- ============================================

-- Admins can do everything (uses existing is_admin() function from migration 015)
create policy "Admins manage promotions" on public.promotions
  for all using (public.is_admin());

-- Unauthenticated users can read currently-live promotions.
-- Needed for landing page to display active promo banners without login.
create policy "Public can read active promotions" on public.promotions
  for select using (
    is_active = true and now() between starts_at and ends_at
  );

-- ============================================
-- DROP OLD FUNCTION (migration 020 approach)
-- ============================================
drop function if exists public.is_free_access_period();

-- ============================================
-- has_promo_access() — used in content RLS policies
-- security definer: bypasses RLS on promotions table so the function
-- can read all active promos regardless of caller auth state.
-- ============================================
create or replace function public.has_promo_access(access_type text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    auth.uid() is not null
    and exists (
      select 1 from public.promotions
      where is_active = true
        and now() between starts_at and ends_at
        and (type::text = 'full_access' or type::text = access_type)
    );
$$;

-- Grant to both authenticated and anon so the function can be called
-- from RLS policies regardless of the user's session state.
grant execute on function public.has_promo_access(text) to authenticated, anon;

-- ============================================
-- UPDATE CONTENT RLS POLICIES
-- Drop old names (migration 001 originals + migration 020 "free period" names)
-- and create new ones that also check for active promotions.
-- ============================================

-- COURSES
drop policy if exists "Active subscribers can view published courses" on public.courses;
drop policy if exists "Subscribers or free period can view published courses" on public.courses;

create policy "Subscribers or promo can view published courses" on public.courses
  for select using (
    is_published = true
    and (
      public.has_promo_access('courses')
      or exists (
        select 1 from public.subscriptions
        where user_id = auth.uid() and status = 'active'
      )
    )
  );

-- LESSONS
drop policy if exists "Active subscribers can view published lessons" on public.lessons;
drop policy if exists "Subscribers or free period can view published lessons" on public.lessons;

create policy "Subscribers or promo can view published lessons" on public.lessons
  for select using (
    is_published = true
    and (
      public.has_promo_access('courses')
      or exists (
        select 1 from public.subscriptions
        where user_id = auth.uid() and status = 'active'
      )
    )
  );

-- SELECTIONS
drop policy if exists "Subscribers can view open selections" on public.selections;
drop policy if exists "Subscribers or free period can view open selections" on public.selections;

create policy "Subscribers or promo can view open selections" on public.selections
  for select using (
    status != 'draft'
    and (
      public.has_promo_access('selections')
      or exists (
        select 1 from public.subscriptions
        where user_id = auth.uid() and status = 'active'
      )
    )
  );

-- RAFFLES
drop policy if exists "Subscribers can view active raffles" on public.raffles;
drop policy if exists "Subscribers or free period can view active raffles" on public.raffles;

create policy "Subscribers or promo can view active raffles" on public.raffles
  for select using (
    status != 'draft'
    and (
      public.has_promo_access('raffles')
      or exists (
        select 1 from public.subscriptions
        where user_id = auth.uid() and status = 'active'
      )
    )
  );

-- PROMOS (the service-offers table, not the promotions/access table)
drop policy if exists "Subscribers can view active promos" on public.promos;
drop policy if exists "Subscribers or free period can view active promos" on public.promos;

create policy "Subscribers or promo can view active promos" on public.promos
  for select using (
    status in ('active', 'sold_out')
    and (
      public.has_promo_access('promos')
      or exists (
        select 1 from public.subscriptions
        where user_id = auth.uid() and status = 'active'
      )
    )
  );

-- ============================================
-- INDEX for fast active-promo lookups from RLS
-- ============================================
create index idx_promotions_active_dates
  on public.promotions (is_active, starts_at, ends_at)
  where is_active = true;
