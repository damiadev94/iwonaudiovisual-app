-- Añadir thumbnail_public_id a la tabla courses para facilitar la gestión con Cloudinary

alter table public.courses
add column thumbnail_public_id text;
