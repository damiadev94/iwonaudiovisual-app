export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { LessonVideoPlayer } from "@/components/platform/LessonVideoPlayer";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock, Lock } from "lucide-react";
import type { Lesson } from "@/types";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!course) notFound();

  const releaseAt = course.release_at ? new Date(course.release_at) : null;
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const isUpcoming = releaseAt !== null && releaseAt.getTime() > nowMs;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .in(
      "lesson_id",
      (lessons || []).map((l: Lesson) => l.id)
    );

  const typedLessons = (lessons || []) as Lesson[];
  const completedCount = (progress || []).filter((p: { completed: boolean }) => p.completed).length;
  const totalLessons = typedLessons.length;
  const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  const categoryLabels: Record<string, string> = {
    finanzas: "Finanzas",
    marketing: "Marketing",
    branding: "Branding",
    distribucion: "Distribución",
    legal: "Legal",
    estrategia: "Estrategia",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline" className="border-gold/20 text-gold">
            {categoryLabels[course.category] || course.category}
          </Badge>
          {isUpcoming && (
            <Badge className="bg-gold text-black border-gold uppercase tracking-widest text-[10px] font-black">
              <Lock className="h-3 w-3 mr-1" />
              Próximamente
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        {course.description && (
          <p className="text-muted-foreground">{course.description}</p>
        )}
        {isUpcoming && releaseAt && (
          <p className="mt-3 text-sm text-gold">
            Estreno:{" "}
            {releaseAt.toLocaleString("es-AR", {
              dateStyle: "long",
              timeStyle: "short",
              timeZone: "America/Argentina/Buenos_Aires",
            })}
          </p>
        )}
      </div>

      {/* Progress */}
      <div className="p-4 rounded-xl bg-iwon-card border border-iwon-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progreso del curso</span>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalLessons} lecciones
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Lessons list */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Lecciones</h2>
        {typedLessons.length === 0 ? (
          <p className="text-muted-foreground">Proximamente: lecciones disponibles.</p>
        ) : (
          typedLessons.map((lesson, index) => {
            const lessonProgress = (progress || []).find(
              (p: { lesson_id: string }) => p.lesson_id === lesson.id
            );
            const isCompleted = lessonProgress?.completed;

            return (
              <div key={lesson.id} className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-iwon-card border border-iwon-border hover:border-gold/30 transition-all">
                  <div className="shrink-0 mt-1">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-iwon-success" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {index + 1}. {lesson.title}
                    </p>
                    {lesson.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {lesson.description}
                      </p>
                    )}
                    {lesson.duration_minutes && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {lesson.duration_minutes} min
                      </div>
                    )}
                  </div>
                </div>

                {lesson.video_public_id && !isCompleted && !isUpcoming && (
                  <LessonVideoPlayer
                    publicId={lesson.video_public_id}
                    title={lesson.title}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
