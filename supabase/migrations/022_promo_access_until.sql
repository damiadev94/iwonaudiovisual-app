-- ============================================
-- PROMO ACCESS UNTIL
-- Adds a personal promo_access_until column to profiles.
-- Set at registration time when a full_access promo is active.
-- Allows per-user access to persist even if the global promo is
-- deactivated early.
-- ============================================

alter table public.profiles
  add column promo_access_until timestamptz;

-- Update has_promo_access to also check the user's personal promo date.
-- Keeps the global promo check as a fallback for users who registered
-- before the promo started.
create or replace function public.has_promo_access(access_type text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    auth.uid() is not null
    and (
      -- Personal promo access granted at registration
      exists (
        select 1 from public.profiles
        where id = auth.uid()
          and promo_access_until is not null
          and promo_access_until > now()
      )
      or
      -- Global active promo (covers users who existed before the promo)
      exists (
        select 1 from public.promotions
        where is_active = true
          and now() between starts_at and ends_at
          and (type::text = 'full_access' or type::text = access_type)
      )
    );
$$;
