import Link from "next/link";
import { BookOpen, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CourseCountdown } from "./CourseCountdown";
import type { Course } from "@/types";

const categoryLabels: Record<string, string> = {
  negocio: "Negocio",
  audiovisual: "Audiovisual",
  marketing: "Marketing",
  publicidad: "Publicidad",
  estrategias: "Estrategias",
};

export function CourseCard({ course }: { course: Course }) {
  const nowMs = Date.now();
  const releaseMs = course.release_at ? new Date(course.release_at).getTime() : null;
  const isUpcoming = releaseMs !== null && releaseMs > nowMs;

  if (isUpcoming) {
    // Horizontal card with countdown to the right
    return (
      <Link href={`/cursos/${course.slug}`}>
        <div className="flex items-center gap-4 rounded-xl bg-iwon-card border border-iwon-border hover:border-gold/30 transition-all duration-300 overflow-hidden p-3 group">
          {/* Thumbnail */}
          <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gold/10 to-iwon-bg-secondary flex items-center justify-center">
            {course.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.thumbnail_url} alt={course.title}
                className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="h-6 w-6 text-gold/30" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Lock className="h-3 w-3 text-gold shrink-0" />
              <Badge variant="outline" className="text-[10px] border-gold/20 text-gold">
                {categoryLabels[course.category] || course.category}
              </Badge>
            </div>
            <p className="font-medium text-sm leading-tight line-clamp-1 group-hover:text-gold transition-colors">{course.title}</p>
          </div>

          {/* Countdown */}
          {course.release_at && (
            <div className="shrink-0">
              <CourseCountdown releaseAt={course.release_at} size="sm" />
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Normal published card
  return (
    <Link href={`/cursos/${course.slug}`}>
      <div className="rounded-xl bg-iwon-card border border-iwon-border hover:border-gold/30 transition-all duration-300 overflow-hidden group">
        <div className="aspect-video bg-linear-to-br from-gold/10 to-iwon-bg-secondary flex items-center justify-center relative">
          {course.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.thumbnail_url} alt={course.title}
              className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="h-12 w-12 text-gold/30" />
          )}
        </div>
        <div className="p-4">
          <Badge variant="outline" className="mb-2 text-xs border-gold/20 text-gold">
            {categoryLabels[course.category] || course.category}
          </Badge>
          <h3 className="font-semibold group-hover:text-gold transition-colors line-clamp-2">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {course.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
