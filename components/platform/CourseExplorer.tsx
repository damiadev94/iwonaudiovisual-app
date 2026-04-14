"use client";

import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PlayCircle, Lock, Video, FileText, Info, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "../ui/skeleton";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  public_id: string;
  duration: number;
  thumbnail: string;
}

interface Course {
  name: string;
  slug: string;
  lessons: Lesson[];
}

interface CourseExplorerProps {
  user: {
    id: string;
    subscriptionStatus: string;
  };
}

export function CourseExplorer({ user }: CourseExplorerProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);

  // Consider admins as active regardless of subscription
  const isAdmin = false; // We could get this from props if needed, but layout handles it.
  const isActive = user.subscriptionStatus === "active";

  useEffect(() => {
    fetchCatalog();
  }, []);

  async function fetchCatalog() {
    try {
      const res = await fetch("/api/cursos/catalog");
      if (!res.ok) throw new Error("Error al cargar el catálogo");
      const data = await res.json();
      setCourses(data);

      if (data.length > 0 && data[0].lessons.length > 0) {
        handleSelectLesson(data[0].lessons[0]);
      }
    } catch (error) {
      toast.error("No se pudo cargar el catálogo de cursos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectLesson(lesson: Lesson) {
    setSelectedLesson(lesson);
    setVideoUrl(null);

    if (!isActive) return;

    setVideoLoading(true);
    try {
      const res = await fetch(`/api/cursos/video-token?publicId=${encodeURIComponent(lesson.public_id)}`);
      if (!res.ok) throw new Error("Error al obtener acceso al video");
      const { url } = await res.json();
      setVideoUrl(url);
    } catch (error) {
      toast.error("No se pudo cargar el video.");
    } finally {
      setVideoLoading(false);
    }
  }

  if (loading) {
    return <ExplorerSkeleton />;
  }

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[600px] gap-6 animate-in fade-in duration-500">
      {/* Sidebar - Course List */}
      <div className="w-full lg:w-80 shrink-0 bg-iwon-card border border-iwon-border rounded-2xl overflow-hidden flex flex-col shadow-xl">
        <div className="p-4 border-b border-iwon-border bg-white/5">
          <h2 className="font-bold flex items-center gap-2 text-gold">
            <Video className="h-4 w-4" />
            Contenido Exclusivo
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <Accordion type="single" collapsible className="space-y-1">
            {courses.map((course, idx) => (
              <AccordionItem key={course.slug} value={course.slug} className="border-none">
                <AccordionTrigger className="px-3 py-2.5 hover:bg-white/5 rounded-xl transition-all hover:no-underline group data-[state=open]:bg-white/5">
                  <div className="flex items-center gap-3 text-left">
                    <div className="bg-gold/10 p-2 rounded-lg text-gold shrink-0 group-hover:bg-gold group-hover:text-black transition-colors">
                      <span className="text-xs font-bold">{idx + 1}</span>
                    </div>
                    <span className="text-sm font-semibold truncate text-white/90">{course.name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-2">
                  <div className="space-y-1 pl-4 pr-1">
                    {course.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 group relative overflow-hidden ${selectedLesson?.id === lesson.id
                          ? "bg-gold text-black font-bold shadow-[0_4px_15px_rgba(212,175,55,0.3)]"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                          }`}
                      >
                        {isActive ? (
                          <PlayCircle className={`h-4 w-4 shrink-0 ${selectedLesson?.id === lesson.id ? "text-black" : "text-gold group-hover:scale-110 transition-transform"}`} />
                        ) : (
                          <Lock className="h-4 w-4 shrink-0 text-muted-foreground/30" />
                        )}
                        <span className="truncate flex-1">{lesson.title}</span>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Main Area - Video Player */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="aspect-video relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-iwon-border ring-1 ring-white/10">
          {isActive ? (
            <>
              {videoLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-iwon-bg/50 backdrop-blur-md z-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
                    <span className="text-xs font-medium text-gold/80 animate-pulse uppercase tracking-widest">Cargando video...</span>
                  </div>
                </div>
              ) : videoUrl ? (
                <video
                  key={videoUrl}
                  src={videoUrl}
                  controls
                  className="w-full h-full"
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  autoPlay
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-center p-6 gap-4">
                  <div className="bg-white/5 p-8 rounded-full">
                    <Video className="h-16 w-16 opacity-10 animate-pulse" />
                  </div>
                  <p className="max-w-[200px] text-sm font-medium">Selecciona una lección para comenzar tu formación</p>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-iwon-bg/95 via-iwon-bg/98 to-black z-30 backdrop-blur-xl">
              <div className="bg-gold/10 p-6 rounded-full mb-8 relative">
                <div className="absolute inset-0 rounded-full bg-gold/5 animate-ping"></div>
                <Lock className="h-14 w-14 text-gold relative z-10" />
              </div>
              <h3 className="text-3xl font-bold mb-4 tracking-tight text-white">Contenido Bloqueado</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-10 text-lg leading-relaxed font-light">
                Para acceder a este curso necesitas una <span className="text-gold font-semibold italic">suscripción activa</span>. Únete a nuestra comunidad y desbloquea todo el contenido.
              </p>
              <Button className="bg-gold hover:bg-gold-light text-black font-black px-12 py-7 h-auto text-xl rounded-2xl shadow-[0_10px_30px_rgba(212,175,55,0.4)] transition-all hover:scale-105 active:scale-95 group">
                ACTIVAR AHORA
                <ChevronRight className="h-6 w-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </div>

        {/* Metadata section */}
        <div className="bg-iwon-card/50 backdrop-blur-sm border border-iwon-border rounded-2xl p-8 flex flex-col gap-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Video className="h-32 w-32 rotate-12" />
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="space-y-4">
              {selectedLesson ? (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="text-[10px] uppercase font-bold tracking-[0.2em] border-gold/30 text-gold bg-gold/10 px-3 py-1">
                      En Curso
                    </Badge>
                    {selectedLesson.duration > 0 && (
                      <Badge variant="outline" className="text-[10px] font-medium border-white/10 text-muted-foreground flex items-center gap-1.5 px-3 py-1">
                        <Info className="h-3.5 w-3.5" />
                        {Math.floor(selectedLesson.duration / 60)} min
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                    {selectedLesson.title}
                  </h1>
                </>
              ) : (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-24 bg-white/5" />
                  <Skeleton className="h-10 w-80 bg-white/5" />
                </div>
              )}
            </div>

            {isActive && (
              <Button variant="outline" size="lg" className="bg-white/5 border-white/10 hover:bg-gold hover:text-black transition-all group shrink-0 rounded-xl h-12 px-6">
                <FileText className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                Material Extra
              </Button>
            )}
          </div>

          <div className="prose prose-invert max-w-none relative z-10">
            <p className="text-muted-foreground text-lg leading-relaxed font-light italic">
              {selectedLesson?.description || "Inicia tu camino hacia la excelencia audiovisual con esta clase magistral. Descubre técnicas avanzadas y optimiza tu proceso de trabajo con los mejores consejos de la industria."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExplorerSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] gap-6">
      <div className="w-full lg:w-80 shrink-0 bg-iwon-card border border-iwon-border rounded-2xl p-4 space-y-4">
        <Skeleton className="h-8 w-40 bg-white/5" />
        <div className="space-y-3 pt-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-12 w-full bg-white/5 opacity-50" />
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-6">
        <Skeleton className="aspect-video w-full rounded-2xl bg-white/5" />
        <div className="bg-iwon-card border border-iwon-border rounded-2xl p-8 space-y-6">
          <Skeleton className="h-10 w-96 bg-white/5" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-white/5 opacity-50" />
            <Skeleton className="h-4 w-5/6 bg-white/5 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
