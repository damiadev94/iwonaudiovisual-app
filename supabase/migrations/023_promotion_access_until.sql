-- ============================================
-- PROMOTION ACCESS UNTIL
-- Separates "registration deadline" (ends_at) from "access period" (access_until).
-- access_until: how long registered users keep access after ends_at.
-- If null, falls back to ends_at.
-- ============================================

alter table public.promotions
  add column access_until timestamptz;
