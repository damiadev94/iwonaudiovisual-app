-- Estreno programado de cursos.
-- NULL = disponible inmediatamente. Valor futuro = estreno programado en UTC.
ALTER TABLE public.courses
  ADD COLUMN release_at TIMESTAMPTZ NULL;
