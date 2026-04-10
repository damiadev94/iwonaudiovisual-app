export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Film, Users } from "lucide-react";
import type { Promo } from "@/types";

export default async function PromosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: promos } = await supabase
    .from("promos")
    .select("*")
    .in("status", ["active", "sold_out"])
    .order("created_at", { ascending: false });

  const { data: bookings } = await supabase
    .from("promo_bookings")
    .select("*")
    .eq("user_id", user.id);

  const typedPromos = (promos || []) as Promo[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Promos de filmacion</h1>
        <p className="text-muted-foreground">
          Reserva tu sesion de filmacion a precios exclusivos para suscriptores.
        </p>
      </div>

      {typedPromos.length === 0 ? (
        <Card className="bg-iwon-card border-iwon-border">
          <CardContent className="py-12 text-center">
            <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No hay promos activas</h3>
            <p className="text-muted-foreground">Te notificaremos cuando haya nuevas promos disponibles.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {typedPromos.map((promo) => {
            const slotsAvailable = promo.max_slots - promo.slots_taken;
            const isSoldOut = promo.status === "sold_out" || slotsAvailable <= 0;
            const hasBooked = (bookings || []).some(
              (b: { promo_id: string }) => b.promo_id === promo.id
            );

            return (
              <Card key={promo.id} className="bg-iwon-card border-iwon-border overflow-hidden">
                {/* Top accent */}
                <div className="h-1 bg-gradient-to-r from-gold to-gold-light" />

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{promo.title}</CardTitle>
                    {isSoldOut ? (
                      <Badge variant="outline" className="bg-iwon-error/10 text-iwon-error border-iwon-error/20">
                        Agotado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-iwon-success/10 text-iwon-success border-iwon-success/20">
                        Disponible
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {promo.description && (
                    <p className="text-sm text-muted-foreground">{promo.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold font-mono text-gold">
                        ${promo.price.toLocaleString("es-AR")}
                      </p>
                      <p className="text-xs text-muted-foreground">Pago unico</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className={slotsAvailable <= 10 ? "text-iwon-warning" : ""}>
                          {slotsAvailable}/{promo.max_slots} cupos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar for slots */}
                  <div className="w-full bg-iwon-bg rounded-full h-2">
                    <div
                      className="bg-gold rounded-full h-2 transition-all"
                      style={{ width: `${(promo.slots_taken / promo.max_slots) * 100}%` }}
                    />
                  </div>

                  {hasBooked ? (
                    <Button disabled className="w-full">
                      Ya reservaste esta promo
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-gold hover:bg-gold-light text-black font-semibold"
                      disabled={isSoldOut}
                    >
                      {isSoldOut ? "Agotado" : "Reservar"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
