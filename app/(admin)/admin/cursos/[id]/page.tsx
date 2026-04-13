export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { LessonManager } from "@/components/admin/LessonManager";
import { ArrowLeft } from "lucide-react";

const categoryLabels: Record<string, string> = {
  finanzas: "Finanzas",
  marketing: "Marketing",
  branding: "Branding",
  distribucion: "Distribución",
  legal: "Legal",
  estrategia: "Estrategia",
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (!course) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", id)
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/cursos"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground text-sm">
            {categoryLabels[course.category] ?? course.category} ·{" "}
            {course.is_published ? (
              <span className="text-iwon-success">Publicado</span>
            ) : (
              <span className="text-muted-foreground">Borrador</span>
            )}
          </p>
        </div>
      </div>

      <LessonManager courseId={id} initialLessons={lessons ?? []} />
    </div>
  );
}
