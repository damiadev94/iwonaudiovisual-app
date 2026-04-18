"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  BookOpen,
  Eye,
  EyeOff,
  ListVideo,
  Upload,
  CheckCircle,
  Trash2,
} from "lucide-react";
import type { Course } from "@/types";

const categories = [
  { value: "negocio", label: "Negocio" },
  { value: "audiovisual", label: "Audiovisual" },
  { value: "marketing", label: "Marketing" },
  { value: "publicidad", label: "Publicidad" },
  { value: "estrategias", label: "Estrategias" },
] as const;

interface ThumbnailResult {
  url: string;
  path: string;
}

// Buenos Aires no aplica horario de verano: offset fijo -03:00.
// Convierte el valor `yyyy-MM-ddTHH:mm` del input datetime-local
// (interpretado como hora local de Argentina) a ISO 8601 UTC.
function buenosAiresLocalToUtcISO(localValue: string): string | null {
  if (!localValue) return null;
  const parsed = new Date(`${localValue}:00-03:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export default function CursosAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("negocio");
  const [thumbnail, setThumbnail] = useState<ThumbnailResult | null>(null);
  const [releaseAtLocal, setReleaseAtLocal] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/admin/cursos");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCourses(data);
    } catch {
      toast.error("Error al cargar cursos");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    try {
      const res = await fetch("/api/admin/cursos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          category: selectedCategory,
          thumbnail_url: thumbnail?.url ?? null,
          thumbnail_public_id: thumbnail?.path ?? null,
          release_at: buenosAiresLocalToUtcISO(releaseAtLocal),
          is_published: false,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al crear");
      }

      toast.success("Curso creado");
      setDialogOpen(false);
      setThumbnail(null);
      setReleaseAtLocal("");
      fetchCourses();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al crear el curso");
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePublish(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/admin/cursos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !current }),
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();
      setCourses(courses.map((c) => (c.id === id ? updated : c)));
    } catch {
      toast.error("Error al actualizar");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este curso? Esto borrará todas sus lecciones y archivos de video."))
      return;

    try {
      const res = await fetch(`/api/admin/cursos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();
      toast.success("Curso eliminado");
      setCourses(courses.filter((c) => c.id !== id));
    } catch {
      toast.error("Error al eliminar");
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload/thumbnail", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al subir");
      }
      const data = await res.json();
      setThumbnail({ url: data.url, path: data.path });
      toast.success("Miniatura cargada");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al subir miniatura");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (loading)
    return <div className="animate-pulse text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cursos</h1>
          <p className="text-muted-foreground">Gestión de cursos y lecciones.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setThumbnail(null);
            setReleaseAtLocal("");
          }
        }}>
          <DialogTrigger
            render={
              <Button className="bg-gold hover:bg-gold-light text-black font-semibold" />
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo curso
          </DialogTrigger>
          <DialogContent className="bg-iwon-card border-iwon-border max-w-lg">
            <DialogHeader>
              <DialogTitle>Crear nuevo curso</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  name="title"
                  required
                  className="bg-iwon-bg border-iwon-border"
                  placeholder="Ej: Marketing para Músicos Independientes"
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  name="description"
                  className="bg-iwon-bg border-iwon-border resize-none"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(v) => setSelectedCategory(v || "negocio")}
                >
                  <SelectTrigger className="bg-iwon-bg border-iwon-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-iwon-card border-iwon-border">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Miniatura (Thumbnail)</Label>
                {thumbnail ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-iwon-bg border border-iwon-success/30">
                    <CheckCircle className="h-4 w-4 text-iwon-success shrink-0" />
                    <span className="text-sm text-iwon-success truncate flex-1">
                      Imagen cargada
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-xs h-6 shrink-0"
                      onClick={() => setThumbnail(null)}
                    >
                      Borrrar
                    </Button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleThumbnailUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      className="w-full border-dashed border-iwon-border hover:border-gold/50 text-muted-foreground hover:text-foreground"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? "Subiendo..." : "Subir miniatura"}
                    </Button>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label>Fecha y hora de estreno (opcional)</Label>
                <input
                  type="datetime-local"
                  value={releaseAtLocal}
                  onChange={(e) => setReleaseAtLocal(e.target.value)}
                  className="h-8 w-full rounded-lg border border-iwon-border bg-iwon-bg px-2.5 py-1 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 [color-scheme:dark]"
                />
                <p className="text-xs text-muted-foreground">
                  Hora de Argentina (UTC-3). Vacío = disponible inmediatamente.
                </p>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gold hover:bg-gold-light text-black font-semibold"
              >
                {submitting ? "Creando..." : "Crear curso"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {courses.map((course) => (
          <Card key={course.id} className="bg-iwon-card border-iwon-border overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-stretch min-h-[80px]">
                <div className="w-1.5 bg-gold shrink-0 dark:bg-gold-dark" />
                <div className="flex-1 flex items-center justify-between p-4 gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded bg-iwon-bg border border-iwon-border flex items-center justify-center shrink-0 overflow-hidden">
                      {course.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-5 w-5 text-gold/60" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{course.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 border-gold/20 text-gold bg-gold/5"
                        >
                          {
                            categories.find((c) => c.value === course.category)
                              ?.label
                          }
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          /{course.slug}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Link href={`/admin/cursos/${course.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 border-iwon-border"
                      >
                        <ListVideo className="h-3.5 w-3.5 mr-1.5" />
                        Lecciones
                      </Button>
                    </Link>

                    <div className="flex items-center gap-2 px-2 border-l border-iwon-border">
                      {course.is_published ? (
                        <Eye className="h-4 w-4 text-iwon-success" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Switch
                        checked={course.is_published}
                        onCheckedChange={() =>
                          togglePublish(course.id, course.is_published)
                        }
                      />
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-iwon-error h-8 w-8 p-0"
                      onClick={() => handleDelete(course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {courses.length === 0 && (
          <p className="text-muted-foreground text-center py-12 bg-iwon-card/30 rounded-lg border border-dashed border-iwon-border">
            No hay cursos creados.
          </p>
        )}
      </div>
    </div>
  );
}
