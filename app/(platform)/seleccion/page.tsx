export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectionTimer } from "@/components/platform/SelectionTimer";
import { Users, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { Selection, SelectionApplication } from "@/types";

const statusLabels: Record<string, string> = {
  open: "Convocatoria abierta",
  reviewing: "En revision",
  announced: "Resultados anunciados",
  in_production: "En produccion",
  completed: "Completada",
};

export default async function SeleccionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: selections } = await supabase
    .from("selections")
    .select("*")
    .neq("status", "draft")
    .order("created_at", { ascending: false });

  const { data: applications } = await supabase
    .from("selection_applications")
    .select("*")
    .eq("user_id", user.id);

  const typedSelections = (selections || []) as Selection[];
  const typedApplications = (applications || []) as SelectionApplication[];
  const activeSelection = typedSelections.find((s) => s.status === "open");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Seleccion &quot;Los 50&quot;</h1>
        <p className="text-muted-foreground">
          Aplica para ser uno de los 50 artistas seleccionados y filmar tu disco completo.
        </p>
      </div>

      {/* Active selection */}
      {activeSelection && (
        <Card className="bg-gold/5 border-gold/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gold" />
                {activeSelection.title}
              </CardTitle>
              <Badge className="bg-iwon-success/10 text-iwon-success border-iwon-success/20">
                {statusLabels[activeSelection.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeSelection.description && (
              <p className="text-muted-foreground">{activeSelection.description}</p>
            )}

            {activeSelection.close_date && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Cierre de convocatoria:</p>
                <SelectionTimer closeDate={activeSelection.close_date} />
              </div>
            )}

            {typedApplications.find((a) => a.selection_id === activeSelection.id) ? (
              <div className="flex items-center gap-2 text-iwon-success">
                <CheckCircle className="h-5 w-5" />
                <span>Ya aplicaste a esta oleada</span>
              </div>
            ) : (
              <Link href="/seleccion/aplicar">
                <Button className="bg-gold hover:bg-gold-light text-black font-semibold">
                  Aplicar ahora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {!activeSelection && (
        <Card className="bg-iwon-card border-iwon-border">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No hay convocatoria abierta</h3>
            <p className="text-muted-foreground">Te notificaremos cuando se abra la proxima oleada.</p>
          </CardContent>
        </Card>
      )}

      {/* Past selections */}
      {typedSelections.filter((s) => s.status !== "open").length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Oleadas anteriores</h2>
          <div className="space-y-3">
            {typedSelections
              .filter((s) => s.status !== "open")
              .map((selection) => {
                const app = typedApplications.find((a) => a.selection_id === selection.id);
                return (
                  <Card key={selection.id} className="bg-iwon-card border-iwon-border">
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">{selection.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {statusLabels[selection.status] || selection.status}
                        </p>
                      </div>
                      {app && (
                        <Badge
                          variant="outline"
                          className={
                            app.status === "selected"
                              ? "bg-iwon-success/10 text-iwon-success border-iwon-success/20"
                              : app.status === "rejected"
                                ? "bg-iwon-error/10 text-iwon-error border-iwon-error/20"
                                : "bg-iwon-warning/10 text-iwon-warning border-iwon-warning/20"
                          }
                        >
                          {app.status === "selected" ? "Seleccionado" : app.status === "rejected" ? "No seleccionado" : "En revision"}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
