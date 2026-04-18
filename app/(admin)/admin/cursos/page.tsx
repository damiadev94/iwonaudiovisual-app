"use client";

import { useEffect, useRef, useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Plus,
  BookOpen,
  Eye,
  EyeOff,
  Upload,
  CheckCircle,
  Trash2,
  Pencil,
  Video,
  VideoOff,
  Loader2,
} from "lucide-react";
import type { Course } from "@/types";

const categories = [
  { value: "negocio", label: "Negocio" },
  { value: "audiovisual", label: "Audiovisual" },
  { value: "marketing", label: "Marketing" },
  { value: "publicidad", label: "Publicidad" },
  { value: "estrategias", label: "Estrategias" },
] as const;

interface ThumbnailResult { url: string; path: string }
interface VideoResult { url: string; uid: string }

function buenosAiresLocalToUtcISO(localValue: string): string | null {
  if (!localValue) return null;
  const parsed = new Date(`${localValue}:00-03:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

// ---------------------------------------------------------------------------
// Shared course form
// ---------------------------------------------------------------------------
function CourseForm({
  defaultValues,
  courseSlug,
  onSubmit,
  submitLabel,
}: {
  defaultValues?: Partial<Course>;
  courseSlug?: string;
  onSubmit: (data: {
    title: string;
    description: string | null;
    category: string;
    thumbnail_url: string | null;
    thumbnail_public_id: string | null;
    video_url: string | null;
    video_uid: string | null;
    release_at: string | null;
  }) => Promise<void>;
  submitLabel: string;
}) {
  const [category, setCategory] = useState(defaultValues?.category ?? "negocio");
  const [releaseAtLocal, setReleaseAtLocal] = useState("");
  const [thumbnail, setThumbnail] = useState<ThumbnailResult | null>(
    defaultValues?.thumbnail_url
      ? { url: defaultValues.thumbnail_url, path: defaultValues.thumbnail_public_id ?? "" }
      : null
  );
  const [video, setVideo] = useState<VideoResult | null>(
    defaultValues?.video_uid
      ? { uid: defaultValues.video_uid, url: defaultValues.video_url ?? "" }
      : null
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  async function handleThumbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload/thumbnail", { method: "POST", body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const d = await res.json();
      setThumbnail({ url: d.url, path: d.path });
      toast.success("Miniatura cargada");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al subir miniatura");
    } finally {
      setUploadingThumb(false);
      if (thumbInputRef.current) thumbInputRef.current.value = "";
    }
  }

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const res = await fetch("/api/admin/video/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "curso", courseSlug: courseSlug ?? "general" }),
      });
      if (!res.ok) throw new Error("No se pudo obtener el URL de subida");
      const { uploadUrl, uid } = await res.json();

      const fd = new FormData();
      fd.append("file", file);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl);
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
      };
      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => xhr.status < 300 ? resolve() : reject(new Error("Error en Cloudflare"));
        xhr.onerror = () => reject(new Error("Error de red"));
        xhr.send(fd);
      });

      setVideo({ uid, url: `https://stream.cloudflare.com/${uid}` });
      toast.success("Video subido a Cloudflare Stream");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al subir video");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      await onSubmit({
        title: fd.get("title") as string,
        description: (fd.get("description") as string) || null,
        category,
        thumbnail_url: thumbnail?.url ?? null,
        thumbnail_public_id: thumbnail?.path ?? null,
        video_url: video?.url ?? null,
        video_uid: video?.uid ?? null,
        release_at: buenosAiresLocalToUtcISO(releaseAtLocal),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Título *</Label>
        <Input
          name="title"
          required
          defaultValue={defaultValues?.title}
          className="bg-iwon-bg border-iwon-border"
          placeholder="Ej: Marketing para Músicos Independientes"
        />
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea
          name="description"
          defaultValue={defaultValues?.description ?? ""}
          className="bg-iwon-bg border-iwon-border resize-none"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Categoría</Label>
        <Select value={category} onValueChange={(v) => setCategory(v || "negocio")}>
          <SelectTrigger className="bg-iwon-bg border-iwon-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-iwon-card border-iwon-border">
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Thumbnail */}
      <div className="space-y-2">
        <Label>Miniatura</Label>
        {thumbnail ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-iwon-bg border border-iwon-success/30">
            <CheckCircle className="h-4 w-4 text-iwon-success shrink-0" />
            <span className="text-sm text-iwon-success truncate flex-1">Imagen cargada</span>
            <Button type="button" size="sm" variant="ghost" className="text-xs h-6 shrink-0"
              onClick={() => setThumbnail(null)}>
              Cambiar
            </Button>
          </div>
        ) : (
          <>
            <input ref={thumbInputRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="hidden" onChange={handleThumbChange} />
            <Button type="button" variant="outline" disabled={uploadingThumb}
              className="w-full border-dashed border-iwon-border hover:border-gold/50 text-muted-foreground hover:text-foreground"
              onClick={() => thumbInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              {uploadingThumb ? "Subiendo..." : "Subir miniatura"}
            </Button>
          </>
        )}
      </div>

      {/* Video */}
      <div className="space-y-2">
        <Label>Video (Cloudflare Stream)</Label>
        {video ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-iwon-bg border border-iwon-success/30">
            <CheckCircle className="h-4 w-4 text-iwon-success shrink-0" />
            <span className="text-xs text-iwon-success truncate flex-1 font-mono">
              {video.uid}
            </span>
            <Button type="button" size="sm" variant="ghost" className="text-xs h-6 shrink-0"
              onClick={() => setVideo(null)}>
              Cambiar
            </Button>
          </div>
        ) : uploading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Subiendo a Cloudflare...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-1" />
          </div>
        ) : (
          <>
            <input ref={fileInputRef} type="file" accept="video/*"
              className="hidden" onChange={handleVideoChange} />
            <Button type="button" variant="outline"
              className="w-full border-dashed border-iwon-border hover:border-gold/50 text-muted-foreground hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Seleccionar video
            </Button>
          </>
        )}
      </div>

      {/* Release date */}
      <div className="space-y-2">
        <Label>Fecha y hora de estreno (opcional)</Label>
        <input
          type="datetime-local"
          value={releaseAtLocal}
          onChange={(e) => setReleaseAtLocal(e.target.value)}
          className="h-8 w-full rounded-lg border border-iwon-border bg-iwon-bg px-2.5 py-1 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 scheme-dark"
        />
        <p className="text-xs text-muted-foreground">
          Hora de Argentina (UTC-3). Vacío = disponible inmediatamente.
        </p>
      </div>

      <Button
        type="submit"
        disabled={submitting || uploading || uploadingThumb}
        className="w-full bg-gold hover:bg-gold-light text-black font-semibold"
      >
        {submitting ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function CursosAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);

  useEffect(() => { fetchCourses(); }, []);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/admin/cursos");
      if (!res.ok) throw new Error();
      setCourses(await res.json());
    } catch {
      toast.error("Error al cargar cursos");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: Parameters<React.ComponentProps<typeof CourseForm>["onSubmit"]>[0]) {
    const res = await fetch("/api/admin/cursos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, is_published: false }),
    });
    if (!res.ok) {
      const d = await res.json();
      toast.error(d.error ?? "Error al crear el curso");
      return;
    }
    toast.success("Curso creado");
    setCreateOpen(false);
    fetchCourses();
  }

  async function handleEdit(data: Parameters<React.ComponentProps<typeof CourseForm>["onSubmit"]>[0]) {
    if (!editCourse) return;
    const res = await fetch(`/api/admin/cursos/${editCourse.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json();
      toast.error(d.error ?? "Error al actualizar");
      return;
    }
    const updated = await res.json();
    setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    toast.success("Curso actualizado");
    setEditCourse(null);
  }

  async function togglePublish(id: string, current: boolean) {
    const res = await fetch(`/api/admin/cursos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !current }),
    });
    if (!res.ok) { toast.error("Error al actualizar"); return; }
    const updated = await res.json();
    setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este curso? También se borrará el video de Cloudflare.")) return;
    const res = await fetch(`/api/admin/cursos/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Error al eliminar"); return; }
    toast.success("Curso eliminado");
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  if (loading)
    return <div className="animate-pulse text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cursos</h1>
          <p className="text-muted-foreground">Cada curso es un video corto.</p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={<Button className="bg-gold hover:bg-gold-light text-black font-semibold" />}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo curso
          </DialogTrigger>
          <DialogContent className="bg-iwon-card border-iwon-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear nuevo curso</DialogTitle>
            </DialogHeader>
            <CourseForm onSubmit={handleCreate} submitLabel="Crear curso" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editCourse} onOpenChange={(open) => !open && setEditCourse(null)}>
        <DialogContent className="bg-iwon-card border-iwon-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar curso</DialogTitle>
          </DialogHeader>
          {editCourse && (
            <CourseForm
              key={editCourse.id}
              defaultValues={editCourse}
              courseSlug={editCourse.slug}
              onSubmit={handleEdit}
              submitLabel="Guardar cambios"
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {courses.map((course) => (
          <Card key={course.id} className="bg-iwon-card border-iwon-border overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-stretch min-h-20">
                <div className="w-1.5 bg-gold shrink-0 dark:bg-gold-dark" />
                <div className="flex-1 flex items-center justify-between p-4 gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded bg-iwon-bg border border-iwon-border flex items-center justify-center shrink-0 overflow-hidden">
                      {course.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={course.thumbnail_url} alt={course.title}
                          className="h-full w-full object-cover" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-gold/60" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{course.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline"
                          className="text-[10px] h-4 border-gold/20 text-gold bg-gold/5">
                          {categories.find((c) => c.value === course.category)?.label}
                        </Badge>
                        {course.video_uid ? (
                          <Badge variant="outline"
                            className="text-[10px] h-4 bg-iwon-success/10 text-iwon-success border-iwon-success/20">
                            <Video className="h-2.5 w-2.5 mr-1" />
                            Video
                          </Badge>
                        ) : (
                          <Badge variant="outline"
                            className="text-[10px] h-4 text-muted-foreground">
                            <VideoOff className="h-2.5 w-2.5 mr-1" />
                            Sin video
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Button size="sm" variant="outline"
                      className="text-xs h-8 border-iwon-border"
                      onClick={() => setEditCourse(course)}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Editar
                    </Button>

                    <div className="flex items-center gap-2 px-2 border-l border-iwon-border">
                      {course.is_published
                        ? <Eye className="h-4 w-4 text-iwon-success" />
                        : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                      <Switch
                        checked={course.is_published}
                        onCheckedChange={() => togglePublish(course.id, course.is_published)}
                      />
                    </div>

                    <Button size="sm" variant="ghost"
                      className="text-muted-foreground hover:text-iwon-error h-8 w-8 p-0"
                      onClick={() => handleDelete(course.id)}>
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
