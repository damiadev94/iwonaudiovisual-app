-- ============================================
-- SONG SUBMISSIONS
-- ============================================
create table public.song_submissions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_path text not null,
  file_name text not null,
  file_size bigint,
  file_type text,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'selected', 'rejected')),
  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create index idx_song_submissions_user on public.song_submissions(user_id);
create index idx_song_submissions_status on public.song_submissions(status);
create index idx_song_submissions_created on public.song_submissions(created_at desc);

alter table public.song_submissions enable row level security;

-- Usuarios pueden ver e insertar sus propias submissions
create policy "Users can view own submissions" on public.song_submissions
  for select using (auth.uid() = user_id);

create policy "Users can insert own submissions" on public.song_submissions
  for insert with check (auth.uid() = user_id);

-- Admins pueden gestionar todas las submissions
create policy "Admins can manage all submissions" on public.song_submissions
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================
-- STORAGE: bucket "canciones" (privado)
-- ============================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'canciones',
  'canciones',
  false,
  52428800,
  array['audio/mpeg', 'audio/wav', 'audio/wave', 'audio/x-wav']
)
on conflict (id) do nothing;

-- Usuarios pueden subir archivos a su propia carpeta
create policy "Users can upload own songs" on storage.objects
  for insert with check (
    bucket_id = 'canciones' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Usuarios pueden ver sus propios archivos
create policy "Users can view own songs" on storage.objects
  for select using (
    bucket_id = 'canciones' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins pueden ver y eliminar todos los archivos
create policy "Admins can view all songs" on storage.objects
  for select using (
    bucket_id = 'canciones' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete songs" on storage.objects
  for delete using (
    bucket_id = 'canciones' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
