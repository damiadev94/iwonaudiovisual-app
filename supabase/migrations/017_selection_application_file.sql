-- Allow file upload instead of demo URL for selection applications
alter table public.selection_applications
  alter column demo_url drop not null;

alter table public.selection_applications
  add column if not exists file_path text,
  add column if not exists file_name text;
