"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Users } from "lucide-react";

export default function AplicarSeleccionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      demo_url: formData.get("demo_url") as string,
      demo_description: formData.get("demo_description") as string,
      tracks_count: parseInt(formData.get("tracks_count") as string) || 5,
    };

    try {
      const res = await fetch("/api/seleccion/aplicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Error al enviar la aplicacion");
        setLoading(false);
        return;
      }

      toast.success("Aplicacion enviada exitosamente");
      router.push("/seleccion");
    } catch {
      toast.error("Error al enviar la aplicacion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-iwon-card border-iwon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gold" />
            Aplicar a la Seleccion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="demo_url">Link a tu demo</Label>
              <Input
                id="demo_url"
                name="demo_url"
                type="url"
                placeholder="https://drive.google.com/... o https://soundcloud.com/..."
                required
                className="bg-iwon-bg border-iwon-border"
              />
              <p className="text-xs text-muted-foreground">
                Subi tu material a Google Drive, Soundcloud, YouTube o cualquier plataforma accesible.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo_description">Descripcion de tu proyecto</Label>
              <Textarea
                id="demo_description"
                name="demo_description"
                placeholder="Conta sobre tu proyecto, tu estilo, que te inspira..."
                required
                minLength={10}
                maxLength={500}
                rows={4}
                className="bg-iwon-bg border-iwon-border resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tracks_count">Cantidad de tracks del disco</Label>
              <Input
                id="tracks_count"
                name="tracks_count"
                type="number"
                min={1}
                max={20}
                defaultValue={5}
                className="bg-iwon-bg border-iwon-border"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gold hover:bg-gold-light text-black font-semibold"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar aplicacion"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
