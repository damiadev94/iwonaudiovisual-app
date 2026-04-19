import { createAdminClient } from "@/lib/supabase/admin";
import { CourseCard } from "@/components/platform/CourseCard";
import { UpcomingHero } from "@/components/platform/UpcomingHero";
import type { Course } from "@/types";

export const revalidate = 60;

export default async function CursosPage() {
  const adminClient = createAdminClient();
  const { data: courses } = await adminClient
    .from("courses")
    .select("*")
    .order("sort_order", { ascending: true });

  const now = Date.now();
  const all = (courses ?? []) as Course[];

  const published = all.filter((c) => c.is_published);
  const upcoming = all
    .filter((c) => !c.is_published && c.release_at && new Date(c.release_at).getTime() > now)
    .sort((a, b) => new Date(a.release_at!).getTime() - new Date(b.release_at!).getTime());

  const nextUp = upcoming[0] ?? null;
  const restUpcoming = upcoming.slice(1);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
          Cursos y Formación
        </h1>
        <p className="text-muted-foreground">
          Contenido exclusivo para potenciar tu carrera musical.
        </p>
      </div>

      {/* Next upcoming — hero */}
      {nextUp && <UpcomingHero course={nextUp} />}

      {/* Published courses */}
      {published.length > 0 && (
        <section className="space-y-4">
          {nextUp && (
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Disponibles
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {published.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* Other upcoming */}
      {restUpcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Próximamente
          </h2>
          <div className="flex flex-col gap-3">
            {restUpcoming.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {published.length === 0 && !nextUp && (
        <div className="rounded-xl border border-dashed border-iwon-border bg-iwon-card/30 py-20 text-center text-muted-foreground">
          Próximamente: nuevos cursos disponibles.
        </div>
      )}
    </div>
  );
}
