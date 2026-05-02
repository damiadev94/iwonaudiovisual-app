export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { StatsCards } from "@/components/admin/StatsCards";
import { ActiveSubscribersCard } from "@/components/admin/ActiveSubscribersCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const { count: activeSubscribers } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const firstDayOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString();

  // Ingresos estimados: suscripciones activas renovadas o creadas este mes.
  // Fuente primaria: payments aprobados este mes.
  // Fallback: plan_amount de suscripciones cuyo período actual inició este mes.
  const { data: paymentsThisMonth } = await supabase
    .from("payments")
    .select("amount")
    .eq("status", "approved")
    .gte("created_at", firstDayOfMonth);

  const paymentsRevenue = (paymentsThisMonth || []).reduce(
    (sum: number, p: { amount: number }) => sum + p.amount,
    0
  );

  let monthlyRevenue = paymentsRevenue;

  if (monthlyRevenue === 0) {
    const { data: renewedThisMonth } = await supabase
      .from("subscriptions")
      .select("plan_amount, created_at, current_period_start")
      .eq("status", "active")
      .or(
        `current_period_start.gte.${firstDayOfMonth},and(current_period_start.is.null,created_at.gte.${firstDayOfMonth})`
      );

    monthlyRevenue = (renewedThisMonth || []).reduce(
      (sum: number, s: { plan_amount: number | null }) => sum + (s.plan_amount ?? 0),
      0
    );
  }

  const { count: activeSelections } = await supabase
    .from("selections")
    .select("*", { count: "exact", head: true })
    .in("status", ["open", "reviewing"]);

  const { count: totalProfiles } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { data: activeSubscribersList } = await supabase
    .from("subscriptions")
    .select("id, status, plan_amount, created_at, profiles(email, full_name, artist_name)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Visión general de Iwon Audiovisual.</p>
      </div>

      <StatsCards
        activeSubscribers={activeSubscribers || 0}
        monthlyRevenue={monthlyRevenue}
        activeSelections={activeSelections || 0}
        totalClips={450}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveSubscribersCard subscribers={activeSubscribersList ?? []} />

        <Card className="bg-iwon-card border-iwon-border">
          <CardHeader>
            <CardTitle className="text-lg">Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total de usuarios</span>
                <span className="font-mono font-bold">{totalProfiles || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Suscriptores activos</span>
                <span className="font-mono font-bold text-iwon-success">{activeSubscribers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ingresos este mes</span>
                <span className="font-mono font-bold text-gold">${monthlyRevenue.toLocaleString("es-AR")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
