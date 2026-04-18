import Link from "next/link";
import { BookOpen, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types";

const categoryLabels: Record<string, string> = {
  finanzas: "Finanzas",
  marketing: "Marketing",
  branding: "Branding",
  distribucion: "Distribución",
  legal: "Legal",
  estrategia: "Estrategia",
  negocio: "Negocio",
  audiovisual: "Audiovisual",
  publicidad: "Publicidad",
  estrategias: "Estrategias",
};

export function CourseCard({ course }: { course: Course }) {
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const isUpcoming = course.release_at
    ? new Date(course.release_at).getTime() > nowMs
    : false;

  return (
    <Link href={`/cursos/${course.slug}`}>
      <div className="rounded-xl bg-iwon-card border border-iwon-border hover:border-gold/30 transition-all duration-300 overflow-hidden group">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-gold/10 to-iwon-bg-secondary flex items-center justify-center relative">
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
          {isUpcoming && (
            <Badge className="absolute top-2 right-2 bg-gold text-black border-gold uppercase tracking-widest text-[10px] font-black">
              <Lock className="h-3 w-3 mr-1" />
              Próximamente
            </Badge>
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
