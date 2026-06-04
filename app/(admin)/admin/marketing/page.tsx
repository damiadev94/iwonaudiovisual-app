"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import type { Promotion, PromotionType } from "@/types/database";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const promotionTypeLabels: Record<PromotionType, string> = {
  full_access: "Acceso total",
  courses: "Cursos",
  raffles: "Sorteos",
  selections: "Selección",
  promos: "Promos de filmación",
};

const promotionTypes: { value: PromotionType; label: string }[] = [
  { value: "full_access", label: "Acceso total" },
  { value: "courses", label: "Cursos" },
  { value: "raffles", label: "Sorteos" },
  { value: "selections", label: "Selección" },
  { value: "promos", label: "Promos de filmación" },
];

// ---------------------------------------------------------------------------
// Date helpers (Argentina = UTC-3)
// ---------------------------------------------------------------------------

/**
 * Converts a UTC ISO string to a local datetime-local input value
 * expressed in Argentina time (UTC-3).
 */
function toLocalDatetimeInput(isoString: string): string {
  const date = new Date(isoString);
  // Argentina is UTC-3: local = UTC - 3h
  const offsetMs = 3 * 60 * 60 * 1000;
  const local = new Date(date.getTime() - offsetMs);
  return local.toISOString().slice(0, 16);
}

/**
 * Converts a "YYYY-MM-DDTHH:mm" string (Argentina UTC-3) to a UTC ISO string.
 */
function fromLocalDatetimeInputToUTC(localStr: string): string {
  const date = new Date(`${localStr}:00-03:00`);
  return date.toISOString();
}

/**
 * Formats a date range for display: "12 jun → 17 jun 2026"
 */
function formatDateRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  };
  const optsWithYear: Intl.DateTimeFormatOptions = {
    ...opts,
    year: "numeric",
  };
  const startStr = start.toLocaleDateString("es-AR", opts);
  const endStr = end.toLocaleDateString("es-AR", optsWithYear);
  return `${startStr} → ${endStr}`;
}

// ---------------------------------------------------------------------------
// Status logic
// ---------------------------------------------------------------------------

type PromoStatus = "activa" | "programada" | "vencida" | "inactiva";

function getPromoStatus(promo: Promotion): PromoStatus {
  if (!promo.is_active) return "inactiva";
  const now = Date.now();
  const starts = new Date(promo.starts_at).getTime();
  const ends = new Date(promo.ends_at).getTime();
  if (ends < now) return "vencida";
  if (starts > now) return "programada";
  return "activa";
}

function StatusBadge({ status }: { status: PromoStatus }) {
  const config: Record<PromoStatus, { label: string; className: string }> = {
    activa: {
      label: "Activa",
      className: "bg-iwon-success/10 text-iwon-success border-iwon-success/20",
    },
    programada: {
      label: "Programada",
      className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    vencida: {
      label: "Vencida",
      className: "bg-muted/30 text-muted-foreground border-muted/20",
    },
    inactiva: {
      label: "Inactiva",
      className: "bg-muted/30 text-muted-foreground border-muted/20",
    },
  };
  const { label, className } = config[status];
  return (
    <Badge variant="outline" className={`text-[10px] h-4 ${className}`}>
      {label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Promotion form
// ---------------------------------------------------------------------------

interface PromotionFormValues {
  name: string;
  type: PromotionType;
  starts_at: string;
  ends_at: string;
  access_until: string | null;
  is_active: boolean;
}

function PromotionForm({
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  defaultValues?: Partial<Promotion>;
  onSubmit: (data: PromotionFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const [type, setType] = useState<PromotionType>(
    defaultValues?.type ?? "full_access"
  );
  const [isActive, setIsActive] = useState(defaultValues?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);

  // Convert stored UTC values to local datetime-local strings for the inputs
  const defaultStartsAt = defaultValues?.starts_at
    ? toLocalDatetimeInput(defaultValues.starts_at)
    : "";
  const defaultEndsAt = defaultValues?.ends_at
    ? toLocalDatetimeInput(defaultValues.ends_at)
    : "";
  const defaultAccessUntil = defaultValues?.access_until
    ? toLocalDatetimeInput(defaultValues.access_until)
    : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const startsAtLocal = fd.get("starts_at") as string;
    const endsAtLocal = fd.get("ends_at") as string;

    const accessUntilLocal = fd.get("access_until") as string;

    if (startsAtLocal && endsAtLocal && endsAtLocal <= startsAtLocal) {
      toast.error("La fecha de fin debe ser posterior a la de inicio");
      setSubmitting(false);
      return;
    }
    if (accessUntilLocal && endsAtLocal && accessUntilLocal <= endsAtLocal) {
      toast.error("El acceso extendido debe ser posterior a la fecha de fin");
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit({
        name: fd.get("name") as string,
        type,
        starts_at: fromLocalDatetimeInputToUTC(startsAtLocal),
        ends_at: fromLocalDatetimeInputToUTC(endsAtLocal),
        access_until: accessUntilLocal
          ? fromLocalDatetimeInputToUTC(accessUntilLocal)
          : null,
        is_active: isActive,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="promo-name">Nombre *</Label>
        <Input
          id="promo-name"
          name="name"
          required
          defaultValue={defaultValues?.name}
          className="bg-iwon-bg border-iwon-border"
          placeholder="Ej: Acceso gratis junio 2026"
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select
          value={type}
          onValueChange={(v) => setType(v as PromotionType)}
        >
          <SelectTrigger className="bg-iwon-bg border-iwon-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-iwon-card border-iwon-border">
            {promotionTypes.map((pt) => (
              <SelectItem key={pt.value} value={pt.value}>
                {pt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Starts at */}
      <div className="space-y-2">
        <Label htmlFor="promo-starts">Inicio *</Label>
        <input
          id="promo-starts"
          name="starts_at"
          type="datetime-local"
          required
          defaultValue={defaultStartsAt}
          className="h-8 w-full rounded-lg border border-iwon-border bg-iwon-bg px-2.5 py-1 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 scheme-dark"
        />
      </div>

      {/* Ends at */}
      <div className="space-y-2">
        <Label htmlFor="promo-ends">Cierre de inscripción *</Label>
        <input
          id="promo-ends"
          name="ends_at"
          type="datetime-local"
          required
          defaultValue={defaultEndsAt}
          className="h-8 w-full rounded-lg border border-iwon-border bg-iwon-bg px-2.5 py-1 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 scheme-dark"
        />
        <p className="text-xs text-muted-foreground">
          Hasta cuándo se puede registrar gratis. Hora Argentina (UTC-3).
        </p>
      </div>

      {/* Access until */}
      <div className="space-y-2">
        <Label htmlFor="promo-access-until">Acceso extendido hasta</Label>
        <input
          id="promo-access-until"
          name="access_until"
          type="datetime-local"
          defaultValue={defaultAccessUntil}
          className="h-8 w-full rounded-lg border border-iwon-border bg-iwon-bg px-2.5 py-1 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 scheme-dark"
        />
        <p className="text-xs text-muted-foreground">
          Opcional. Hasta cuándo tienen acceso los que se registraron. Si no se completa, usa la fecha de cierre.
        </p>
      </div>

      {/* Is active */}
      <div className="flex items-center justify-between rounded-lg border border-iwon-border bg-iwon-bg px-3 py-2.5">
        <Label htmlFor="promo-active" className="cursor-pointer">
          Activa
        </Label>
        <Switch
          id="promo-active"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-gold hover:bg-gold-light text-black font-semibold"
      >
        {submitting ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function PromotionSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="bg-iwon-card border-iwon-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-48 rounded bg-iwon-border animate-pulse" />
                <div className="h-3 w-32 rounded bg-iwon-border animate-pulse" />
              </div>
              <div className="h-6 w-20 rounded bg-iwon-border animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MarketingAdminPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  async function fetchPromotions() {
    try {
      const res = await fetch("/api/admin/promotions");
      if (!res.ok) throw new Error();
      setPromotions(await res.json());
    } catch {
      toast.error("Error al cargar promociones");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: PromotionFormValues) {
    const res = await fetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error(d.details ?? d.error ?? "Error al crear la promoción");
      return;
    }
    toast.success("Promoción creada");
    setCreateOpen(false);
    fetchPromotions();
  }

  async function handleEdit(data: PromotionFormValues) {
    if (!editPromotion) return;
    const res = await fetch(`/api/admin/promotions/${editPromotion.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error ?? "Error al actualizar");
      return;
    }
    toast.success("Promoción actualizada");
    setEditPromotion(null);
    fetchPromotions();
  }

  async function handleToggleActive(promo: Promotion) {
    const res = await fetch(`/api/admin/promotions/${promo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !promo.is_active }),
    });
    if (!res.ok) {
      toast.error("Error al actualizar el estado");
      return;
    }
    fetchPromotions();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta promoción?")) return;
    const res = await fetch(`/api/admin/promotions/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Error al eliminar");
      return;
    }
    toast.success("Promoción eliminada");
    fetchPromotions();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-gold" />
            Marketing · Promociones
          </h1>
          <p className="text-muted-foreground">
            Gestioná promociones de acceso y campañas activas.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={
              <Button className="bg-gold hover:bg-gold-light text-black font-semibold" />
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Promoción
          </DialogTrigger>
          <DialogContent className="bg-iwon-card border-iwon-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear nueva promoción</DialogTitle>
            </DialogHeader>
            <PromotionForm onSubmit={handleCreate} submitLabel="Crear" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog
        open={!!editPromotion}
        onOpenChange={(open) => !open && setEditPromotion(null)}
      >
        <DialogContent className="bg-iwon-card border-iwon-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar promoción</DialogTitle>
          </DialogHeader>
          {editPromotion && (
            <PromotionForm
              key={editPromotion.id}
              defaultValues={editPromotion}
              onSubmit={handleEdit}
              submitLabel="Guardar cambios"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* List */}
      {loading ? (
        <PromotionSkeleton />
      ) : (
        <div className="space-y-3">
          {promotions.map((promo) => {
            const status = getPromoStatus(promo);
            return (
              <Card
                key={promo.id}
                className="bg-iwon-card border-iwon-border overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="flex items-stretch min-h-16">
                    {/* Active indicator strip */}
                    <div
                      className={`w-1.5 shrink-0 ${
                        status === "activa"
                          ? "bg-iwon-success"
                          : status === "programada"
                          ? "bg-amber-400"
                          : "bg-iwon-border"
                      }`}
                    />

                    <div className="flex-1 flex items-center justify-between p-4 gap-4">
                      {/* Info */}
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <h3 className="font-medium truncate">{promo.name}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 border-gold/20 text-gold bg-gold/5"
                          >
                            {promotionTypeLabels[promo.type]}
                          </Badge>
                          <StatusBadge status={status} />
                          <span className="text-xs text-muted-foreground">
                            {formatDateRange(promo.starts_at, promo.ends_at)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 border-iwon-border"
                          onClick={() => setEditPromotion(promo)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          Editar
                        </Button>

                        <div className="flex items-center gap-2 px-2 border-l border-iwon-border">
                          <Switch
                            checked={promo.is_active}
                            onCheckedChange={() => handleToggleActive(promo)}
                            aria-label={`${promo.is_active ? "Desactivar" : "Activar"} ${promo.name}`}
                          />
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-iwon-error h-8 w-8 p-0"
                          onClick={() => handleDelete(promo.id)}
                          aria-label={`Eliminar ${promo.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {promotions.length === 0 && (
            <p className="text-muted-foreground text-center py-12 bg-iwon-card/30 rounded-lg border border-dashed border-iwon-border">
              No hay promociones creadas.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
