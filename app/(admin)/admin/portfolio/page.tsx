"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, ExternalLink, Images, Pencil } from "lucide-react";
import type { PortfolioItem } from "@/types";

export default function PortfolioAdminPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const res = await fetch("/api/admin/portfolio");
    if (res.ok) {
      const json = await res.json();
      setItems(json.items as PortfolioItem[]);
    }
    setLoading(false);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageFile(file);
    if (editPreview) URL.revokeObjectURL(editPreview);
    setEditPreview(URL.createObjectURL(file));
  }

  function openEdit(item: PortfolioItem) {
    setEditItem(item);
    setEditImageFile(null);
    setEditPreview(null);
  }

  function closeEdit() {
    setEditItem(null);
    setEditImageFile(null);
    if (editPreview) URL.revokeObjectURL(editPreview);
    setEditPreview(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Selecciona una imagen de portada");
      return;
    }
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("file", imageFile);

    const res = await fetch("/api/admin/portfolio", {
      method: "POST",
      body: formData,
    });
    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error || "Error al subir");
    } else {
      toast.success("Item agregado al portfolio");
      formRef.current?.reset();
      setImageFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      fetchItems();
    }
    setUploading(false);
  }

  async function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editItem) return;
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    if (editImageFile) formData.set("file", editImageFile);

    const res = await fetch(`/api/admin/portfolio?id=${editItem.id}`, {
      method: "PATCH",
      body: formData,
    });
    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error || "Error al actualizar");
    } else {
      toast.success("Item actualizado");
      closeEdit();
      fetchItems();
    }
    setSaving(false);
  }

  async function handleDelete(item: PortfolioItem) {
    const res = await fetch(`/api/admin/portfolio?id=${item.id}`, {
      method: "DELETE",
    });
    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error || "Error al eliminar");
    } else {
      toast.success("Item eliminado");
      fetchItems();
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Images className="h-6 w-6 text-gold" />
          Portfolio
        </h1>
        <p className="text-muted-foreground">
          Videos que se muestran en la landing page.
        </p>
      </div>

      {/* Upload form */}
      <Card className="bg-iwon-card border-iwon-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5 text-gold" />
            Agregar item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre del tema</Label>
                <Input
                  name="nombre_tema"
                  required
                  placeholder="Ej: La Noche"
                  className="bg-iwon-bg border-iwon-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre del artista</Label>
                <Input
                  name="nombre_artista"
                  required
                  placeholder="Ej: Juan Lopez"
                  className="bg-iwon-bg border-iwon-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Link de YouTube</Label>
                <Input
                  name="youtube_link"
                  required
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  className="bg-iwon-bg border-iwon-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Imagen de portada</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="bg-iwon-bg border-iwon-border cursor-pointer file:text-gold file:font-medium"
                />
              </div>
            </div>

            {preview && (
              <div className="w-48 h-28 rounded-lg overflow-hidden border border-iwon-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <Button
              type="submit"
              disabled={uploading}
              className="bg-gold hover:bg-gold-light text-black font-semibold"
            >
              {uploading ? "Subiendo..." : "Agregar al portfolio"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Items list */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Items publicados ({items.length})
        </h2>

        {loading ? (
          <div className="animate-pulse text-muted-foreground text-sm">Cargando...</div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No hay items en el portfolio. Agrega el primero arriba.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-iwon-card border border-iwon-border hover:border-gold/20 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-24 h-14 rounded-lg overflow-hidden shrink-0 border border-iwon-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url_portada}
                    alt={item.nombre_tema}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.nombre_tema}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.nombre_artista}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={item.youtube_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver en YouTube"
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-iwon-bg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(item)}
                    className="border-iwon-border hover:border-gold/40 hover:text-gold h-8 px-3"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item)}
                    className="border-iwon-border hover:border-red-500/40 hover:text-red-400 h-8 px-3"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) closeEdit(); }}>
        <DialogContent className="bg-iwon-card border-iwon-border sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar item</DialogTitle>
          </DialogHeader>

          {editItem && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del tema</Label>
                <Input
                  name="nombre_tema"
                  required
                  defaultValue={editItem.nombre_tema}
                  className="bg-iwon-bg border-iwon-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre del artista</Label>
                <Input
                  name="nombre_artista"
                  required
                  defaultValue={editItem.nombre_artista}
                  className="bg-iwon-bg border-iwon-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Link de YouTube</Label>
                <Input
                  name="youtube_link"
                  required
                  type="url"
                  defaultValue={editItem.youtube_link}
                  className="bg-iwon-bg border-iwon-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Imagen de portada <span className="text-muted-foreground text-xs">(opcional — dejá vacío para mantener la actual)</span></Label>
                <div className="flex gap-3 items-start">
                  <div className="w-24 h-14 rounded-lg overflow-hidden border border-iwon-border shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editPreview ?? editItem.url_portada}
                      alt="Portada"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="bg-iwon-bg border-iwon-border cursor-pointer file:text-gold file:font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gold hover:bg-gold-light text-black font-semibold"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEdit}
                  className="border-iwon-border"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
