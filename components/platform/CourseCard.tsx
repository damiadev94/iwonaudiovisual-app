import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types";

const categoryLabels: Record<string, string> = {
  finanzas: "Finanzas",
  marketing: "Marketing",
  branding: "Branding",
  distribucion: "Distribución",
  legal: "Legal",
  estrategia: "Estrategia",
};

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/cursos/${course.slug}`}>
      <div className="rounded-xl bg-iwon-card border border-iwon-border hover:border-gold/30 transition-all duration-300 overflow-hidden group">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-gold/10 to-iwon-bg-secondary flex items-center justify-center">
          {course.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="h-12 w-12 text-gold/30" />
          )}
        </div>

        {/* Info */}
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
