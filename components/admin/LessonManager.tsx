"use client";

import { useState } from "react";
import * as tus from "tus-js-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Trash2,
  Video,
  VideoOff,
  GripVertical,
  Pencil,
  Upload,
  CheckCircle,
  Loader2,
  Link2,
} from "lucide-react";
import type { Lesson } from "@/types";

const CF_UID_REGEX = /^[a-f0-9]{32}$/i;

function buildIframePlaceholderUrl(uid: string): string {
  return `https://customer-[account].cloudflarestream.com/${uid}/iframe`;
}

interface VideoUploadResult {
  url: string;
  uid: string;
}

interface LessonFormState {
  title: string;
  description: string;
  duration_minutes: string;
  sort_order: string;
  video: VideoUploadResult | null;
}

const emptyForm = (nextOrder: number): LessonFormState => ({
  title: "",
  description: "",
  duration_minutes: "",
  sort_order: String(nextOrder),
  video: null,
});

export function LessonManager({
  courseSlug,
  courseId,
  initialLessons,
}: {
  courseSlug: string;
  courseId: string;
  initialLessons: Lesson[];
}) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [addOpen, setAddOpen] = useState(false);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [form, setForm] = useState<LessonFormState>(emptyForm(0));
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"upload" | "uid">("upload");
  const [uidInput, setUidInput] = useState("");
  const [uidError, setUidError] = useState<string | null>(null);

  function resetVideoModeState() {
    setInputMode("upload");
    setUidInput("");
    setUidError(null);
  }

  function openAdd() {
    setForm(emptyForm(lessons.length));
    resetVideoModeState();
    setAddOpen(true);
  }

  function openEdit(lesson: Lesson) {
    setForm({
      title: lesson.title,
      description: lesson.description ?? "",
      duration_minutes: lesson.duration_minutes?.toString() ?? "",
      sort_order: String(lesson.sort_order),
      video:
        lesson.video_url && lesson.video_public_id
          ? { url: lesson.video_url, uid: lesson.video_public_id }
          : null,
    });
    resetVideoModeState();
    setEditLesson(lesson);
  }

  function handleApplyUid() {
    const uid = uidInput.trim();
    if (!CF_UID_REGEX.test(uid)) {
      setUidError("UID inválido. Debe ser una cadena hexadecimal de 32 caracteres.");
      return;
    }
    setUidError(null);
    setForm((prev) => ({
      ...prev,
      video: { uid, url: buildIframePlaceholderUrl(uid) },
    }));
    setUidInput("");
    toast.success("UID aplicado a la lección.");
  }

  async function handleFileSelected(file: File) {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await fetch("/api/admin/video/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title || "Lección", courseSlug, fileSize: file.size }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "No se pudo obtener el URL de subida");
      }

      const { uploadUrl, uid } = await res.json();

      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          // uploadUrl = pre-created slot by Cloudflare → PATCH directly, no POST
          uploadUrl,
          chunkSize: 5 * 1024 * 1024, // 5 MB chunks
          retryDelays: [0, 3000, 6000, 12000, 24000],
          metadata: {
            filename: file.name,
            filetype: file.type,
            name: form.title.trim() || file.name,
          },
          onProgress(bytesSent, bytesTotal) {
            const percent = Math.round((bytesSent / bytesTotal) * 100);
            setUploadProgress(percent);
          },
          onSuccess() {
            resolve();
          },
          onError(err) {
            reject(err);
          },
        });
        upload.start();
      });

      setForm((prev) => ({
        ...prev,
        video: { url: `https://stream.cloudflare.com/${uid}`, uid },
      }));
      toast.success("Video subido correctamente a Cloudflare");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al subir el video");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  async function handleSubmitAdd(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/cursos/${courseId}/lecciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          video_url: form.video?.url ?? null,
          video_public_id: form.video?.uid ?? null,
          duration_minutes: form.duration_minutes
            ? parseInt(form.duration_minutes)
            : null,
          sort_order: parseInt(form.sort_order) || lessons.length,
          is_published: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al crear la lección");
        return;
      }
      setLessons((prev) =>
        [...prev, data as Lesson].sort((a, b) => a.sort_order - b.sort_order)
      );
      setAddOpen(false);
      toast.success("Lección creada");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitEdit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editLesson || !form.title.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/lecciones/${editLesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          video_url: form.video?.url ?? null,
          video_public_id: form.video?.uid ?? null,
          duration_minutes: form.duration_minutes
            ? parseInt(form.duration_minutes)
            : null,
          sort_order: parseInt(form.sort_order) || editLesson.sort_order,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al actualizar la lección");
        return;
      }
      setLessons((prev) =>
        prev
          .map((l) => (l.id === editLesson.id ? (data as Lesson) : l))
          .sort((a, b) => a.sort_order - b.sort_order)
      );
      setEditLesson(null);
      toast.success("Lección actualizada");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePublish(lesson: Lesson) {
    setTogglingId(lesson.id);
    try {
      const res = await fetch(`/api/admin/lecciones/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !lesson.is_published }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al actualizar");
        return;
      }
      setLessons((prev) =>
        prev.map((l) => (l.id === lesson.id ? (data as Lesson) : l))
      );
    } catch {
      toast.error("Error de conexión");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(lesson: Lesson) {
    if (!confirm(`¿Eliminar la lección "${lesson.title}"?`)) return;
    setDeletingId(lesson.id);
    try {
      const res = await fetch(`/api/admin/lecciones/${lesson.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al eliminar");
        return;
      }
      setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
      toast.success("Lección eliminada");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Lecciones{" "}
          <span className="text-muted-foreground font-normal text-sm">
            ({lessons.length})
          </span>
        </h2>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger
            render={
              <Button className="bg-gold hover:bg-gold-light text-black font-semibold" />
            }
            onClick={openAdd}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva lección
          </DialogTrigger>
          <DialogContent className="bg-iwon-card border-iwon-border max-w-lg">
            <DialogHeader>
              <DialogTitle>Nueva lección</DialogTitle>
            </DialogHeader>
            <LessonForm
              form={form}
              setForm={setForm}
              onSubmit={handleSubmitAdd}
              onVideoUpload={handleFileSelected}
              uploading={uploading}
              uploadProgress={uploadProgress}
              submitting={submitting}
              submitLabel="Crear lección"
              inputMode={inputMode}
              setInputMode={setInputMode}
              uidInput={uidInput}
              setUidInput={setUidInput}
              uidError={uidError}
              onApplyUid={handleApplyUid}
            />
          </DialogContent>
        </Dialog>
      </div>

      {lessons.length === 0 ? (
        <Card className="bg-iwon-card border-iwon-border">
          <CardContent className="py-12 text-center text-muted-foreground">
            <VideoOff className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No hay lecciones en este curso.</p>
            <p className="text-sm mt-1">Crea la primera lección para empezar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id} className="bg-iwon-card border-iwon-border">
              <CardContent className="py-3 flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">
                      {index + 1}. {lesson.title}
                    </span>
                    {lesson.video_public_id ? (
                      <Badge
                        variant="outline"
                        className="text-xs bg-iwon-success/10 text-iwon-success border-iwon-success/20 shrink-0"
                      >
                        <Video className="h-3 w-3 mr-1" />
                        CF Stream
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground shrink-0"
                      >
                        Sin video
                      </Badge>
                    )}
                    {lesson.duration_minutes && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {lesson.duration_minutes} min
                      </span>
                    )}
                  </div>
                  {lesson.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {lesson.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={lesson.is_published}
                    disabled={togglingId === lesson.id}
                    onCheckedChange={() => handleTogglePublish(lesson)}
                  />

                  <Dialog
                    open={editLesson?.id === lesson.id}
                    onOpenChange={(open) => !open && setEditLesson(null)}
                  >
                    <DialogTrigger
                      render={<Button size="sm" variant="ghost" className="h-7 w-7 p-0" />}
                      onClick={() => openEdit(lesson)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </DialogTrigger>
                    <DialogContent className="bg-iwon-card border-iwon-border max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Editar lección</DialogTitle>
                      </DialogHeader>
                      <LessonForm
                        form={form}
                        setForm={setForm}
                        onSubmit={handleSubmitEdit}
                        onVideoUpload={handleFileSelected}
                        uploading={uploading}
                        uploadProgress={uploadProgress}
                        submitting={submitting}
                        submitLabel="Guardar cambios"
                        showSortOrder
                        inputMode={inputMode}
                        setInputMode={setInputMode}
                        uidInput={uidInput}
                        setUidInput={setUidInput}
                        uidError={uidError}
                        onApplyUid={handleApplyUid}
                      />
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-iwon-error"
                    disabled={deletingId === lesson.id}
                    onClick={() => handleDelete(lesson)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Extracted form — used for both create and edit dialogs
// ---------------------------------------------------------------------------

function LessonForm({
  form,
  setForm,
  onSubmit,
  onVideoUpload,
  uploading,
  uploadProgress,
  submitting,
  submitLabel,
  showSortOrder = false,
  inputMode,
  setInputMode,
  uidInput,
  setUidInput,
  uidError,
  onApplyUid,
}: {
  form: LessonFormState;
  setForm: React.Dispatch<React.SetStateAction<LessonFormState>>;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onVideoUpload: (file: File) => void;
  uploading: boolean;
  uploadProgress: number;
  submitting: boolean;
  submitLabel: string;
  showSortOrder?: boolean;
  inputMode: "upload" | "uid";
  setInputMode: React.Dispatch<React.SetStateAction<"upload" | "uid">>;
  uidInput: string;
  setUidInput: React.Dispatch<React.SetStateAction<string>>;
  uidError: string | null;
  onApplyUid: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Título *</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          required
          className="bg-iwon-bg border-iwon-border"
          placeholder="Ej: Introducción a las finanzas del artista"
        />
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          className="bg-iwon-bg border-iwon-border resize-none"
          rows={3}
          placeholder="Descripción breve de la lección..."
        />
      </div>

      <div className={`grid gap-4 ${showSortOrder ? "grid-cols-2" : "grid-cols-1"}`}>
        <div className="space-y-2">
          <Label>Duración (min)</Label>
          <Input
            type="number"
            min={1}
            max={600}
            value={form.duration_minutes}
            onChange={(e) =>
              setForm((p) => ({ ...p, duration_minutes: e.target.value }))
            }
            className="bg-iwon-bg border-iwon-border"
            placeholder="Ej: 15"
          />
        </div>
        {showSortOrder && (
          <div className="space-y-2">
            <Label>Orden</Label>
            <Input
              type="number"
              min={0}
              value={form.sort_order}
              onChange={(e) =>
                setForm((p) => ({ ...p, sort_order: e.target.value }))
              }
              className="bg-iwon-bg border-iwon-border"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Video (Cloudflare Stream)</Label>
        {form.video ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-iwon-bg border border-iwon-success/30">
            <CheckCircle className="h-4 w-4 text-iwon-success shrink-0" />
            <span className="text-sm text-iwon-success truncate flex-1">
              Video listo: {form.video.uid}
            </span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-xs h-6 shrink-0"
              onClick={() => setForm((p) => ({ ...p, video: null }))}
            >
              Cambiar
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-iwon-bg border border-iwon-border">
              <button
                type="button"
                onClick={() => setInputMode("upload")}
                className={`text-xs font-medium py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  inputMode === "upload"
                    ? "bg-gold text-black"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Upload className="h-3 w-3" />
                Subir archivo
              </button>
              <button
                type="button"
                onClick={() => setInputMode("uid")}
                className={`text-xs font-medium py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  inputMode === "uid"
                    ? "bg-gold text-black"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Link2 className="h-3 w-3" />
                Pegar UID existente
              </button>
            </div>

            {inputMode === "upload" ? (
              uploading ? (
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
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onVideoUpload(file);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed border-iwon-border hover:border-gold/50 text-muted-foreground hover:text-foreground"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Seleccionar video para Cloudflare
                  </Button>
                </div>
              )
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={uidInput}
                    onChange={(e) => setUidInput(e.target.value)}
                    placeholder="UID hex de 32 caracteres"
                    className="bg-iwon-bg border-iwon-border font-mono text-xs"
                  />
                  <Button
                    type="button"
                    onClick={onApplyUid}
                    disabled={!uidInput.trim()}
                    className="bg-gold hover:bg-gold-light text-black font-semibold shrink-0"
                  >
                    Aplicar
                  </Button>
                </div>
                {uidError ? (
                  <p className="text-xs text-iwon-error">{uidError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Pega el UID de un video ya cargado en Cloudflare Stream.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Button
        type="submit"
        disabled={submitting || uploading || !form.title.trim()}
        className="w-full bg-gold hover:bg-gold-light text-black font-semibold disabled:opacity-50"
      >
        {submitting ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
