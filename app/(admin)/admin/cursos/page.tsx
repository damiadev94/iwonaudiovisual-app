"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CldUploadWidget } from "next-cloudinary";
import type { CloudinaryUploadWidgetResults } from "@cloudinary-util/types";
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
  GripVertical,
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
  secure_url: string;
  public_id: string;
}

export default function CursosAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("negocio");
  const [thumbnail, setThumbnail] = useState<ThumbnailResult | null>(null);
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
          thumbnail_url: thumbnail?.secure_url ?? null,
          thumbnail_public_id: thumbnail?.public_id ?? null,
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
      fetchCourses();
    } catch (err: any) {
      toast.error(err.message || "Error al crear el curso");
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

  function handleThumbnailUpload(results: CloudinaryUploadWidgetResults) {
    if (results.event !== "success" || typeof results.info !== "object") return;
    const info = results.info as { secure_url: string; public_id: string };
    setThumbnail({ secure_url: info.secure_url, public_id: info.public_id });
    toast.success("Miniatura cargada");
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
          if (!open) setThumbnail(null);
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
                  <CldUploadWidget
                    signatureEndpoint="/api/admin/cloudinary/sign"
                    options={{
                      resourceType: "image",
                      folder: "iwon/cursos",
                      maxFiles: 1,
                      clientAllowedFormats: ["jpg", "png", "webp"],
                    }}
                    onSuccess={handleThumbnailUpload}
                  >
                    {({ open }) => (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed border-iwon-border hover:border-gold/50 text-muted-foreground hover:text-foreground"
                        onClick={() => open()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Subir miniatura
                      </Button>
                    )}
                  </CldUploadWidget>
                )}
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
