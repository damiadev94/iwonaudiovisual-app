export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { StatsCards } from "@/components/admin/StatsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const { count: activeSubscribers } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { data: payments } = await supabase
    .from("payments")
    .select("amount")
    .eq("status", "approved")
    .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const monthlyRevenue = (payments || []).reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);

  const { count: activeSelections } = await supabase
    .from("selections")
    .select("*", { count: "exact", head: true })
    .in("status", ["open", "reviewing"]);

  const { count: totalProfiles } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Recent subscribers
  const { data: recentProfiles } = await supabase
    .from("profiles")
    .select("full_name, artist_name, email, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Vision general de Iwon Audiovisual.</p>
      </div>

      <StatsCards
        activeSubscribers={activeSubscribers || 0}
        monthlyRevenue={monthlyRevenue}
        activeSelections={activeSelections || 0}
        totalClips={450}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-iwon-card border-iwon-border">
          <CardHeader>
            <CardTitle className="text-lg">Registros recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentProfiles || []).map((profile: { full_name: string | null; artist_name: string | null; email: string; created_at: string }, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-iwon-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{profile.full_name || profile.artist_name || "Sin nombre"}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString("es-AR")}
                  </span>
                </div>
              ))}
              {(!recentProfiles || recentProfiles.length === 0) && (
                <p className="text-sm text-muted-foreground">No hay registros aun.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-iwon-card border-iwon-border">
          <CardHeader>
            <CardTitle className="text-lg">Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total usuarios</span>
                <span className="font-mono font-bold">{totalProfiles || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Suscriptores activos</span>
                <span className="font-mono font-bold text-iwon-success">{activeSubscribers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Revenue este mes</span>
                <span className="font-mono font-bold text-gold">${monthlyRevenue.toLocaleString("es-AR")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
