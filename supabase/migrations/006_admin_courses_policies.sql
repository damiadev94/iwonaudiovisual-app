-- Políticas de RLS para administradores en cursos y lecciones

-- Cursos: Permitir todo a admins
create policy "Admins can manage courses"
on public.courses
for all
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  )
);

-- Lecciones: Permitir todo a admins
create policy "Admins can manage lessons"
on public.lessons
for all
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  )
);
