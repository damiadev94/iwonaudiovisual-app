export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CourseCard } from "@/components/platform/CourseCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Course } from "@/types";

const categories = [
  { value: "all", label: "Todos" },
  { value: "finanzas", label: "Finanzas" },
  { value: "marketing", label: "Marketing" },
  { value: "branding", label: "Branding" },
  { value: "distribucion", label: "Distribucion" },
  { value: "legal", label: "Legal" },
  { value: "estrategia", label: "Estrategia" },
];

export default async function CursosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const typedCourses = (courses || []) as Course[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Cursos</h1>
        <p className="text-muted-foreground">Formacion para impulsar tu carrera musical.</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="bg-iwon-card border border-iwon-border">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className="data-[state=active]:bg-gold data-[state=active]:text-black"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {typedCourses.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Proximamente: nuevos cursos disponibles.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {typedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </TabsContent>

        {categories.slice(1).map((cat) => (
          <TabsContent key={cat.value} value={cat.value} className="mt-6">
            {typedCourses.filter((c) => c.category === cat.value).length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No hay cursos de {cat.label} disponibles aun.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {typedCourses
                  .filter((c) => c.category === cat.value)
                  .map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
