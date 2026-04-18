import { createAdminClient } from "@/lib/supabase/admin";
import { CourseCard } from "@/components/platform/CourseCard";
import type { Course } from "@/types";

export const revalidate = 60;

export default async function CursosPage() {
  const adminClient = createAdminClient();
  const { data: courses } = await adminClient
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const list = (courses ?? []) as Course[];

  return (
    <div className="h-full space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Cursos y Formación
        </h1>
        <p className="text-muted-foreground">
          Explora nuestro catálogo de contenido exclusivo y potencia tu carrera musical.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-iwon-border bg-iwon-card/30 py-20 text-center text-muted-foreground">
          Próximamente: nuevos cursos disponibles.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
