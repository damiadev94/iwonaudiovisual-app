-- Actualizar las categorías de cursos
-- 1. Eliminar la restricción antigua
-- 2. Limpiar cualquier dato antiguo si existiera (el usuario dice que no hay cursos)
-- 3. Añadir la nueva restricción

ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_category_check;

ALTER TABLE public.courses ADD CONSTRAINT courses_category_check 
CHECK (category IN ('negocio', 'audiovisual', 'marketing', 'publicidad', 'estrategias'));
