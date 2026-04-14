"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, ExternalLink, Images } from "lucide-react";
import type { PortfolioItem } from "@/types";

export default function PortfolioAdminPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const supabase = createClient();
    const { data } = await supabase
      .from("portfolio")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data || []) as PortfolioItem[]);
    setLoading(false);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Selecciona una imagen de portada");
      return;
    }
    setUploading(true);

    const supabase = createClient();
    const ext = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(fileName, imageFile, { upsert: false });

    if (uploadError) {
      toast.error("Error al subir la imagen: " + uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("portfolio").getPublicUrl(fileName);

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase.from("portfolio").insert({
      url_portada: publicUrl,
      youtube_link: formData.get("youtube_link") as string,
      nombre_tema: formData.get("nombre_tema") as string,
      nombre_artista: formData.get("nombre_artista") as string,
    });

    if (error) {
      toast.error("Error al guardar: " + error.message);
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

  async function handleDelete(item: PortfolioItem) {
    const supabase = createClient();

    // Extract just the filename from the public URL
    const fileName = item.url_portada.split("/").pop();
    if (fileName) {
      await supabase.storage.from("portfolio").remove([fileName]);
    }

    const { error } = await supabase
      .from("portfolio")
      .delete()
      .eq("id", item.id);

    if (error) {
      toast.error("Error al eliminar");
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
              <div className="relative w-48 h-28 rounded-lg overflow-hidden border border-iwon-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
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

      {/* Items grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Items publicados ({items.length})
        </h2>

        {loading ? (
          <div className="animate-pulse text-muted-foreground text-sm">
            Cargando...
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No hay items en el portfolio. Agrega el primero arriba.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-lg overflow-hidden border border-iwon-border hover:border-gold/30 transition-all"
              >
                <div className="aspect-video relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url_portada}
                    alt={item.nombre_tema}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                    <p className="text-xs font-semibold text-white text-center leading-tight">
                      {item.nombre_tema}
                    </p>
                    <p className="text-xs text-gold text-center">
                      {item.nombre_artista}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <a
                        href={item.youtube_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        title="Ver en YouTube"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-white" />
                      </a>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-2 bg-iwon-card">
                  <p className="text-xs font-medium truncate">
                    {item.nombre_tema}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.nombre_artista}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
