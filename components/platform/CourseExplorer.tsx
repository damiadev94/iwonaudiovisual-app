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
  releaseDate?: string | null;
}

interface Course {
  name: string;
  slug: string;
  releaseDate: string | null;
  isUpcoming: boolean;
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
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const isActive = user.subscriptionStatus === "active";

  useEffect(() => {
    fetchCatalog();
    
    // Timer for countdowns
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  async function fetchCatalog() {
    try {
      const res = await fetch("/api/cursos/catalog");
      if (!res.ok) throw new Error("Error al cargar el catálogo");
      const data = await res.json();
      setCourses(data);
      
      if (data.length > 0) {
        setSelectedCourse(data[0]);
        if (data[0].lessons.length > 0 && !data[0].isUpcoming) {
          handleSelectLesson(data[0].lessons[0], data[0]);
        }
      }
    } catch (error) {
      toast.error("No se pudo cargar el catálogo de cursos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectLesson(lesson: Lesson, course: Course) {
    setSelectedCourse(course);
    setSelectedLesson(lesson);
    setVideoUrl(null);
    setVideoLoading(true);
    
    if (course.isUpcoming) {
      setVideoLoading(false);
      return;
    }
    
    if (!isActive) {
      setVideoLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/cursos/video-token?publicId=${encodeURIComponent(lesson.public_id)}`);
      if (res.status === 403) {
        const errorData = await res.json();
        if (errorData.releaseDate) {
          // Si el servidor detecta que el video es futuro aunque el curso no lo supiera
          setSelectedCourse({ ...course, isUpcoming: true, releaseDate: errorData.releaseDate });
          return;
        }
        throw new Error(errorData.error || "Acceso denegado.");
      }
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al obtener acceso al video");
      }
      const { url } = await res.json();
      setVideoUrl(url);
    } catch (error: any) {
      toast.error(error.message || "No se pudo cargar el video.");
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
            Catálogo de Cursos
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <Accordion type="single" collapsible className="space-y-1">
            {courses.map((course, idx) => (
              <AccordionItem key={course.slug} value={course.slug} className="border-none">
                <AccordionTrigger 
                  className={`px-3 py-2.5 hover:bg-white/5 rounded-xl transition-all hover:no-underline group data-[state=open]:bg-white/5 relative overflow-hidden ${
                    course.isUpcoming ? "opacity-75" : ""
                  }`}
                  onClick={() => {
                    setSelectedCourse(course);
                    if (course.isUpcoming) setSelectedLesson(null);
                  }}
                >
                  <div className="flex items-center gap-3 text-left w-full">
                    <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                      course.isUpcoming 
                        ? "bg-muted text-muted-foreground" 
                        : "bg-gold/10 text-gold group-hover:bg-gold group-hover:text-black"
                    }`}>
                      <span className="text-xs font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold truncate text-white/90">{course.name}</span>
                      {course.isUpcoming && (
                        <span className="text-[10px] text-gold font-bold uppercase tracking-widest mt-0.5 animate-pulse">
                          Estreno
                        </span>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-2">
                  <div className="space-y-1 pl-4 pr-1">
                    {course.lessons.map((lesson) => {
                      const isLocked = course.isUpcoming;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson, course)}
                          disabled={isLocked}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 group relative overflow-hidden ${
                            selectedLesson?.id === lesson.id 
                              ? "bg-gold text-black font-bold" 
                              : isLocked 
                                ? "text-muted-foreground/30 border border-white/5 cursor-not-allowed"
                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                          }`}
                        >
                          {isLocked ? (
                            <Lock className="h-3.5 w-3.5 shrink-0 opacity-40" />
                          ) : isActive ? (
                            <PlayCircle className={`h-4 w-4 shrink-0 ${selectedLesson?.id === lesson.id ? "text-black" : "text-gold group-hover:scale-110 transition-transform"}`} />
                          ) : (
                            <Lock className="h-4 w-4 shrink-0 text-muted-foreground/30" />
                          )}
                          <span className="truncate flex-1">{lesson.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Main Area - Video Player */}
      <div className="flex-1 flex flex-col gap-6">
        <div className={`aspect-video relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-iwon-border ring-1 ring-white/10 ${
          selectedCourse?.isUpcoming ? "ring-gold/30" : ""
        }`}>
          {videoLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-20">
              <Skeleton className="w-full h-full bg-white/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
              </div>
            </div>
          ) : selectedCourse?.isUpcoming ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-iwon-bg/95 via-black to-iwon-bg z-30 overflow-hidden">
               {/* Animated Background effects */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-gold/5 blur-3xl opacity-50"></div>
               
               <Badge className="mb-6 bg-gold text-black border-gold px-4 py-1 text-xs uppercase font-black tracking-widest">
                 PRÓXIMAMENTE
               </Badge>
               
               <h3 className="text-3xl md:text-5xl font-black mb-8 tracking-tighter text-white uppercase italic">
                 {selectedCourse.name}
               </h3>
               
               <Countdown targetDate={selectedCourse.releaseDate} currentTime={currentTime} />
               
               <div className="mt-10 space-y-2">
                 <p className="text-gold font-bold text-lg tracking-tight">
                   Este contenido estará disponible el {selectedCourse.releaseDate && new Date(selectedCourse.releaseDate).toLocaleDateString("es-AR", {
                     day: "numeric",
                     month: "long",
                     year: "numeric"
                   })}
                 </p>
                 <p className="text-muted-foreground/60 max-w-sm mx-auto text-sm leading-relaxed font-light italic">
                   "Estamos preparando cada detalle para garantizarte la mejor formación audiovisual."
                 </p>
               </div>
            </div>
          ) : isActive ? (
            <>
              {videoUrl ? (
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
                    <Video className="h-16 w-16 opacity-10" />
                  </div>
                  <p className="max-w-[200px] text-sm font-medium">Selecciona una lección para comenzar</p>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-iwon-bg/95 z-30 backdrop-blur-xl">
              <div className="bg-gold/10 p-6 rounded-full mb-8">
                <Lock className="h-14 w-14 text-gold" />
              </div>
              <h3 className="text-3xl font-bold mb-4 tracking-tight text-white uppercase italic">Acceso Restringido</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-10 text-lg leading-relaxed font-light">
                Este contenido requiere una <span className="text-gold font-semibold">suscripción activa</span>. ¡Únete a la élite y desbloquea todo el catálogo!
              </p>
              <Button className="bg-gold hover:bg-gold-light text-black font-black px-12 py-7 h-auto text-xl rounded-2xl shadow-[0_10px_30px_rgba(212,175,55,0.4)] transition-all hover:scale-105 active:scale-95 group">
                ACTIVAR SUSCRIPCIÓN
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
                      {selectedCourse?.isUpcoming ? "Próximo Lanzamiento" : "En Curso"}
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
              ) : selectedCourse ? (
                <>
                   <div className="flex flex-wrap items-center gap-3">
                    <Badge className="text-[10px] uppercase font-bold tracking-[0.2em] border-gold/30 text-gold bg-gold/10 px-3 py-1">
                      Información del Curso
                    </Badge>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                    {selectedCourse.name}
                  </h1>
                </>
              ) : (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-24 bg-white/5" />
                  <Skeleton className="h-10 w-80 bg-white/5" />
                </div>
              )}
            </div>
            
            {isActive && !selectedCourse?.isUpcoming && (
              <Button variant="outline" size="lg" className="bg-white/5 border-white/10 hover:bg-gold hover:text-black transition-all group shrink-0 rounded-xl h-12 px-6">
                <FileText className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                Material Extra
              </Button>
            )}
          </div>
          
          <div className="prose prose-invert max-w-none relative z-10">
            <p className="text-muted-foreground text-lg leading-relaxed font-light italic">
              {selectedLesson?.description || 
               `Explora los secretos de ${selectedCourse?.name || "nuestros cursos"} con esta formación de nivel profesional. Diseñada para transformar tu carrera.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Countdown({ targetDate, currentTime }: { targetDate: string | null; currentTime: Date }) {
  if (!targetDate) return null;
  
  const target = new Date(targetDate);
  const diff = target.getTime() - currentTime.getTime();
  
  if (diff <= 0) return <div className="text-gold font-bold text-2xl animate-pulse">¡YA DISPONIBLE!</div>;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return (
    <div className="grid grid-cols-4 gap-4 md:gap-8">
      {[
        { label: "Días", val: days },
        { label: "Horas", val: hours },
        { label: "Mins", val: minutes },
        { label: "Segs", val: seconds }
      ].map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 w-16 h-16 md:w-24 md:h-24 rounded-2xl flex items-center justify-center mb-2 shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-2xl md:text-5xl font-black text-gold tabular-nums z-10">
              {item.val.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-muted-foreground">
            {item.label}
          </span>
        </div>
      ))}
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
