"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { SubscriptionStatus } from "@/components/platform/SubscriptionStatus";
import { toast } from "sonner";
import { User, Music, Crown } from "lucide-react";
import type { Profile, Subscription } from "@/types";

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: subData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setProfile(profileData);
      setSubscription(subData);
      setLoading(false);
    }

    fetchData();
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const updates = {
      full_name: formData.get("full_name") as string,
      artist_name: formData.get("artist_name") as string,
      bio: formData.get("bio") as string,
      phone: formData.get("phone") as string,
      instagram_url: formData.get("instagram_url") as string,
      spotify_url: formData.get("spotify_url") as string,
      youtube_url: formData.get("youtube_url") as string,
    };

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      toast.error("Error al guardar el perfil");
    } else {
      toast.success("Perfil actualizado");
    }

    setSaving(false);
  }

  async function handleCancelSubscription() {
    if (!confirm("Estas seguro de que queres cancelar tu suscripcion?")) return;

    try {
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscription?.id }),
      });

      if (res.ok) {
        toast.success("Suscripcion cancelada");
        setSubscription(subscription ? { ...subscription, status: "cancelled" } : null);
      } else {
        toast.error("Error al cancelar la suscripcion");
      }
    } catch {
      toast.error("Error al cancelar la suscripcion");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">Edita tu informacion de artista.</p>
      </div>

      {/* Subscription */}
      <Card className="bg-iwon-card border-iwon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-gold" />
            Suscripcion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estado</span>
            <SubscriptionStatus subscription={subscription} />
          </div>
          {subscription?.status === "active" && (
            <Button
              variant="outline"
              size="sm"
              className="border-iwon-error/30 text-iwon-error hover:bg-iwon-error/10"
              onClick={handleCancelSubscription}
            >
              Cancelar suscripcion
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card className="bg-iwon-card border-iwon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-gold" />
            Informacion personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre completo</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={profile?.full_name || ""}
                  className="bg-iwon-bg border-iwon-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist_name">Nombre artistico</Label>
                <Input
                  id="artist_name"
                  name="artist_name"
                  defaultValue={profile?.artist_name || ""}
                  className="bg-iwon-bg border-iwon-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={profile?.bio || ""}
                rows={3}
                className="bg-iwon-bg border-iwon-border resize-none"
                placeholder="Conta sobre vos y tu musica..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={profile?.phone || ""}
                className="bg-iwon-bg border-iwon-border"
                placeholder="+54 11 1234-5678"
              />
            </div>

            <Separator className="bg-iwon-border" />

            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Music className="h-4 w-4 text-gold" />
                Redes sociales
              </h3>
              <div className="space-y-2">
                <Label htmlFor="instagram_url">Instagram</Label>
                <Input
                  id="instagram_url"
                  name="instagram_url"
                  defaultValue={profile?.instagram_url || ""}
                  className="bg-iwon-bg border-iwon-border"
                  placeholder="https://instagram.com/tu_usuario"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spotify_url">Spotify</Label>
                <Input
                  id="spotify_url"
                  name="spotify_url"
                  defaultValue={profile?.spotify_url || ""}
                  className="bg-iwon-bg border-iwon-border"
                  placeholder="https://open.spotify.com/artist/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube_url">YouTube</Label>
                <Input
                  id="youtube_url"
                  name="youtube_url"
                  defaultValue={profile?.youtube_url || ""}
                  className="bg-iwon-bg border-iwon-border"
                  placeholder="https://youtube.com/@tu_canal"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="bg-gold hover:bg-gold-light text-black font-semibold"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
