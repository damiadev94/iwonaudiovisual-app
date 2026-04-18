-- Cursos cortos: cada curso tiene un único video.
-- Movemos los campos de video de lessons a courses.
ALTER TABLE public.courses
  ADD COLUMN video_url text,
  ADD COLUMN video_uid text;
