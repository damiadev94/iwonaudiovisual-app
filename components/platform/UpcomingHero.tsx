"use client";

import { useRouter } from "next/navigation";
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

export function UpcomingHero({ course }: { course: Course }) {
  const router = useRouter();

  return (
    <Link href={`/cursos/${course.slug}`} className="block group">
      <div className="relative rounded-2xl overflow-hidden border border-gold/20 bg-gradient-to-br from-iwon-bg via-black to-iwon-bg-secondary hover:border-gold/40 transition-colors">
        {/* Background thumbnail blur */}
        {course.thumbnail_url && (
          <div className="absolute inset-0 opacity-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.thumbnail_url}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
          </div>
        )}

        <div className="relative flex flex-col md:flex-row gap-6 md:gap-10 p-6 md:p-10">
          {/* Thumbnail */}
          <div className="w-full md:w-72 shrink-0 aspect-video md:aspect-auto md:h-44 rounded-xl overflow-hidden bg-iwon-card border border-white/10 flex items-center justify-center">
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

          {/* Content */}
          <div className="flex flex-col justify-center gap-4 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-gold text-black border-gold uppercase tracking-widest text-[10px] font-black">
                <Lock className="h-3 w-3 mr-1" />
                Próximo estreno
              </Badge>
              <Badge variant="outline" className="border-gold/20 text-gold text-xs">
                {categoryLabels[course.category] || course.category}
              </Badge>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-gold transition-colors">{course.title}</h2>
              {course.description && (
                <p className="text-muted-foreground mt-2 line-clamp-2 text-sm md:text-base">
                  {course.description}
                </p>
              )}
            </div>

            {course.release_at && (
              <div className="space-y-2">
                <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                  Estreno en
                </p>
                <CourseCountdown
                  releaseAt={course.release_at}
                  size="lg"
                  onDone={() => router.refresh()}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
