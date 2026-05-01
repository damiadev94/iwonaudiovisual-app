"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Film,
  Users,
  Trash2,
  ChevronDown,
  ChevronUp,
  Upload,
  Loader2,
  MessageCircle,
  Check,
} from "lucide-react";
import Image from "next/image";
import type { Promo, PromoBooking } from "@/types";

type BookingWithProfile = PromoBooking & {
  profiles: { full_name: string | null; email: string | null } | null;
};

function formatARS(v: number) {
  return v.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export default function PromosAdminPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedBookings, setExpandedBookings] = useState<Record<string, boolean>>({});
  const [bookings, setBookings] = useState<Record<string, BookingWithProfile[]>>({});
  const [waLink, setWaLink] = useState("");
  const [waLinkSaved, setWaLinkSaved] = useState(false);
  const [waSaving, setWaSaving] = useState(false);

  const fetchPromos = useCallback(async () => {
    const supabase = createClient();
    const [{ data: promosData }, { data: waSetting }] = await Promise.all([
      supabase.from("promos").select("*").order("created_at", { ascending: false }),
      supabase.from("settings").select("value").eq("key", "whatsapp_link").single(),
    ]);
    setPromos((promosData || []) as Promo[]);
    setWaLink(waSetting?.value ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  async function toggleBookings(promoId: string) {
    const next = !expandedBookings[promoId];
    setExpandedBookings((prev) => ({ ...prev, [promoId]: next }));
    if (next && !bookings[promoId]) {
      const supabase = createClient();
      const { data } = await supabase
        .from("promo_bookings")
        .select("*, profiles(full_name, email)")
        .eq("promo_id", promoId)
        .order("created_at", { ascending: false });
      setBookings((prev) => ({ ...prev, [promoId]: (data || []) as BookingWithProfile[] }));
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const fileInput = form.querySelector<HTMLInputElement>('input[name="cover_file"]');
    const file = fileInput?.files?.[0];
    let coverPath: string | null = null;

    if (file) {
      const ext = file.type.split("/")[1].replace("jpeg", "jpg");
      const path = `${crypto.randomUUID()}.${ext}`;
      const supabaseForUpload = createClient();
      const { error: uploadError } = await supabaseForUpload.storage
        .from("promo-covers")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) {
        toast.error("Error al subir la portada");
        return;
      }
      coverPath = path;
    }

    const supabase = createClient();
    const { error } = await supabase.from("promos").insert({
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || null,
      cover_image_path: coverPath,
      original_price: parseFloat(fd.get("original_price") as string) || null,
      price: parseFloat(fd.get("price") as string) || 0,
      max_slots: parseInt(fd.get("max_slots") as string) || 100,
      available_until: (fd.get("available_until") as string) || null,
      status: "draft",
    });

    if (error) {
      toast.error("Error al crear la promo");
    } else {
      toast.success("Promo creada");
      setCreateOpen(false);
      fetchPromos();
    }
  }

  async function handleSaveWaLink() {
    setWaSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("settings")
      .update({ value: waLink.trim() || null, updated_at: new Date().toISOString() })
      .eq("key", "whatsapp_link");
    setWaSaving(false);
    if (error) {
      toast.error("Error al guardar el link");
    } else {
      setWaLinkSaved(true);
      setTimeout(() => setWaLinkSaved(false), 2000);
      toast.success("Link de WhatsApp guardado");
    }
  }

  async function handleUpdateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/promos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Error al actualizar");
    } else {
      toast.success("Estado actualizado");
      fetchPromos();
    }
  }

  async function handleDelete(promo: Promo) {
    if (!confirm(`¿Eliminar "${promo.title}"? Se borrarán todas las reservas.`)) return;
    const res = await fetch(`/api/admin/promos/${promo.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Error al eliminar");
    } else {
      toast.success("Promo eliminada");
      fetchPromos();
    }
  }

  if (loading) return <div className="animate-pulse text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promos</h1>
          <p className="text-muted-foreground">Gestión de promos de filmación.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button className="bg-gold hover:bg-gold-light text-black font-semibold" />}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva promo
          </DialogTrigger>
          <DialogContent className="bg-iwon-card border-iwon-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear nueva promo</DialogTitle>
            </DialogHeader>
            <PromoForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      {/* WhatsApp config */}
      <Card className="bg-iwon-card border-iwon-border">
        <CardContent className="pt-5">
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                Link de WhatsApp (global)
              </Label>
              <Input
                value={waLink}
                onChange={(e) => setWaLink(e.target.value)}
                placeholder="https://wa.me/5491123456789"
                className="bg-iwon-bg border-iwon-border font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Se usa como destino en el botón de reserva de todas las promos.
              </p>
            </div>
            <Button
              onClick={handleSaveWaLink}
              disabled={waSaving}
              variant="outline"
              className="shrink-0 h-9"
            >
              {waLinkSaved ? (
                <><Check className="h-4 w-4 mr-1 text-iwon-success" /> Guardado</>
              ) : waSaving ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Guardando</>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {promos.map((promo) => (
          <PromoCard
            key={promo.id}
            promo={promo}
            bookingList={bookings[promo.id]}
            expanded={!!expandedBookings[promo.id]}
            onToggleBookings={() => toggleBookings(promo.id)}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDelete}
          />
        ))}
        {promos.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No hay promos creadas.</p>
        )}
      </div>
    </div>
  );
}

// ─── PromoForm ───────────────────────────────────────────────────────────────

function PromoForm({ onSubmit }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void> }) {
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cover image */}
      <div className="space-y-2">
        <Label>Portada</Label>
        <div
          className="border border-dashed border-iwon-border rounded-lg p-4 text-center cursor-pointer hover:border-gold transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            <div className="relative w-full h-36">
              <Image src={preview} alt="preview" fill className="object-cover rounded" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground py-4">
              <Upload className="h-6 w-6" />
              <span className="text-sm">JPG, PNG o WEBP · máx 5 MB</span>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          name="cover_file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPreview(URL.createObjectURL(f));
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Título *</Label>
        <Input name="title" required className="bg-iwon-bg border-iwon-border" />
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea name="description" rows={3} className="bg-iwon-bg border-iwon-border" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Precio tachado (ARS)</Label>
          <Input name="original_price" type="number" placeholder="ej: 80000" className="bg-iwon-bg border-iwon-border" />
        </div>
        <div className="space-y-2">
          <Label>Precio promo (ARS) *</Label>
          <Input name="price" type="number" required placeholder="ej: 49999" className="bg-iwon-bg border-iwon-border" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cupos máximos</Label>
          <Input name="max_slots" type="number" defaultValue={100} className="bg-iwon-bg border-iwon-border" />
        </div>
        <div className="space-y-2">
          <Label>Fecha límite</Label>
          <Input name="available_until" type="date" className="bg-iwon-bg border-iwon-border" />
        </div>
      </div>

      <Button type="submit" disabled={submitting} className="w-full bg-gold hover:bg-gold-light text-black font-semibold">
        {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creando...</> : "Crear promo"}
      </Button>
    </form>
  );
}

// ─── PromoCard ───────────────────────────────────────────────────────────────

function PromoCard({
  promo,
  bookingList,
  expanded,
  onToggleBookings,
  onUpdateStatus,
  onDelete,
}: {
  promo: Promo;
  bookingList: BookingWithProfile[] | undefined;
  expanded: boolean;
  onToggleBookings: () => void;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onDelete: (promo: Promo) => Promise<void>;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <Card className="bg-iwon-card border-iwon-border">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          {promo.cover_image_path && (
            <div className="relative w-20 h-16 shrink-0 rounded overflow-hidden">
              <Image
                src={`${supabaseUrl}/storage/v1/object/public/promo-covers/${promo.cover_image_path}`}
                alt={promo.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base flex items-center gap-2">
                <Film className="h-4 w-4 text-blue-400 shrink-0" />
                {promo.title}
              </CardTitle>
              <Badge variant="outline" className="text-xs">{promo.status}</Badge>
            </div>
            {promo.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{promo.description}</p>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0 text-muted-foreground hover:text-iwon-error"
            onClick={() => onDelete(promo)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Precio promo</p>
            <p className="font-mono font-bold text-gold">{formatARS(promo.price)}</p>
            {promo.original_price && (
              <p className="text-xs text-muted-foreground line-through">{formatARS(promo.original_price)}</p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground text-xs flex items-center gap-1"><Users className="h-3 w-3" /> Cupos</p>
            <p className="font-medium">{promo.slots_taken}/{promo.max_slots}</p>
          </div>
          {promo.available_until && (
            <div>
              <p className="text-muted-foreground text-xs">Fecha límite</p>
              <p className="font-medium text-xs">
                {new Date(promo.available_until).toLocaleDateString("es-AR")}
              </p>
            </div>
          )}
        </div>

        <div className="w-full bg-iwon-bg rounded-full h-1.5">
          <div
            className="bg-gold rounded-full h-1.5"
            style={{ width: `${Math.min((promo.slots_taken / promo.max_slots) * 100, 100)}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {promo.status === "draft" && (
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onUpdateStatus(promo.id, "active")}>
              Activar
            </Button>
          )}
          {promo.status === "active" && (
            <>
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onUpdateStatus(promo.id, "sold_out")}>
                Marcar agotado
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onUpdateStatus(promo.id, "completed")}>
                Completar
              </Button>
            </>
          )}
          {(promo.status === "sold_out" || promo.status === "completed") && (
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onUpdateStatus(promo.id, "draft")}>
              Volver a borrador
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-7 ml-auto text-muted-foreground"
            onClick={onToggleBookings}
          >
            <Users className="h-3 w-3 mr-1" />
            Reservas ({promo.slots_taken})
            {expanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
          </Button>
        </div>

        {/* Bookings list */}
        {expanded && (
          <div className="border-t border-iwon-border pt-3 space-y-2">
            {!bookingList ? (
              <p className="text-xs text-muted-foreground text-center py-2">Cargando...</p>
            ) : bookingList.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">Sin reservas todavía.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {bookingList.map((b) => (
                  <div key={b.id} className="flex items-center justify-between text-xs bg-iwon-bg rounded-md px-3 py-2 gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{b.profiles?.full_name ?? "—"}</p>
                      <p className="text-muted-foreground truncate">{b.profiles?.email ?? "—"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-gold">{b.booking_token.slice(0, 8)}…</p>
                      <p className="text-muted-foreground">
                        {new Date(b.created_at).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
