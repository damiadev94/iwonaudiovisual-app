-- Habilitar extensiones
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extiende auth.users de Supabase)
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  artist_name text,
  avatar_url text,
  phone text,
  bio text,
  genres text[] default '{}',
  instagram_url text,
  spotify_url text,
  youtube_url text,
  role text not null default 'user' check (role in ('user', 'admin', 'moderator')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mp_subscription_id text,
  mp_preapproval_id text,
  status text not null default 'pending' check (status in ('pending', 'active', 'paused', 'cancelled', 'expired')),
  plan_amount decimal(10,2) default 9999.00,
  currency text default 'ARS',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- PAYMENTS
-- ============================================
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subscription_id uuid references public.subscriptions(id),
  mp_payment_id text,
  amount decimal(10,2) not null,
  currency text default 'ARS',
  status text not null check (status in ('pending', 'approved', 'rejected', 'refunded')),
  payment_method text,
  created_at timestamptz default now()
);

-- ============================================
-- COURSES
-- ============================================
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  description text,
  thumbnail_url text,
  category text not null check (category in ('finanzas', 'marketing', 'branding', 'distribucion', 'legal', 'estrategia')),
  is_published boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- LESSONS
-- ============================================
create table public.lessons (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  video_url text,
  video_public_id text,
  duration_minutes int,
  sort_order int default 0,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- LESSON PROGRESS
-- ============================================
create table public.lesson_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  completed boolean default false,
  progress_seconds int default 0,
  completed_at timestamptz,
  unique(user_id, lesson_id)
);

-- ============================================
-- SELECTIONS
-- ============================================
create table public.selections (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'open', 'reviewing', 'announced', 'in_production', 'completed')),
  open_date timestamptz,
  close_date timestamptz,
  announcement_date timestamptz,
  max_selected int default 50,
  created_at timestamptz default now()
);

-- ============================================
-- SELECTION APPLICATIONS
-- ============================================
create table public.selection_applications (
  id uuid default uuid_generate_v4() primary key,
  selection_id uuid references public.selections(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  demo_url text not null,
  demo_description text,
  tracks_count int default 5,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'selected', 'rejected')),
  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  unique(selection_id, user_id)
);

-- ============================================
-- RAFFLES
-- ============================================
create table public.raffles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  prize_description text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'cancelled')),
  draw_date timestamptz,
  winner_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ============================================
-- RAFFLE ENTRIES
-- ============================================
create table public.raffle_entries (
  id uuid default uuid_generate_v4() primary key,
  raffle_id uuid references public.raffles(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(raffle_id, user_id)
);

-- ============================================
-- PROMOS
-- ============================================
create table public.promos (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price decimal(10,2) default 49999.00,
  max_slots int default 200,
  slots_taken int default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'sold_out', 'completed')),
  available_from timestamptz,
  available_until timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- PROMO BOOKINGS
-- ============================================
create table public.promo_bookings (
  id uuid default uuid_generate_v4() primary key,
  promo_id uuid references public.promos(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mp_payment_id text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_subscriptions_user on public.subscriptions(user_id);
create index idx_subscriptions_status on public.subscriptions(status);
create index idx_payments_user on public.payments(user_id);
create index idx_lessons_course on public.lessons(course_id);
create index idx_lesson_progress_user on public.lesson_progress(user_id);
create index idx_selection_apps_selection on public.selection_applications(selection_id);
create index idx_selection_apps_user on public.selection_applications(user_id);
create index idx_raffle_entries_raffle on public.raffle_entries(raffle_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.selections enable row level security;
alter table public.selection_applications enable row level security;
alter table public.raffles enable row level security;
alter table public.raffle_entries enable row level security;
alter table public.promos enable row level security;
alter table public.promo_bookings enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Subscriptions
create policy "Users can view own subscription" on public.subscriptions for select using (auth.uid() = user_id);

-- Courses & Lessons
create policy "Active subscribers can view published courses" on public.courses for select using (
  is_published = true and exists (
    select 1 from public.subscriptions where user_id = auth.uid() and status = 'active'
  )
);
create policy "Active subscribers can view published lessons" on public.lessons for select using (
  is_published = true and exists (
    select 1 from public.subscriptions where user_id = auth.uid() and status = 'active'
  )
);

-- Lesson progress
create policy "Users manage own progress" on public.lesson_progress for all using (auth.uid() = user_id);

-- Selections
create policy "Subscribers can view open selections" on public.selections for select using (
  status != 'draft' and exists (
    select 1 from public.subscriptions where user_id = auth.uid() and status = 'active'
  )
);

-- Selection applications
create policy "Users manage own applications" on public.selection_applications for all using (auth.uid() = user_id);

-- Raffles
create policy "Subscribers can view active raffles" on public.raffles for select using (
  status != 'draft' and exists (
    select 1 from public.subscriptions where user_id = auth.uid() and status = 'active'
  )
);
create policy "Users manage own raffle entries" on public.raffle_entries for all using (auth.uid() = user_id);

-- Promos
create policy "Subscribers can view active promos" on public.promos for select using (
  status in ('active', 'sold_out') and exists (
    select 1 from public.subscriptions where user_id = auth.uid() and status = 'active'
  )
);
create policy "Users manage own bookings" on public.promo_bookings for all using (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Crear perfil automaticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Actualizar updated_at automaticamente
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();
create trigger update_subscriptions_updated_at before update on public.subscriptions
  for each row execute procedure public.update_updated_at();
create trigger update_courses_updated_at before update on public.courses
  for each row execute procedure public.update_updated_at();
