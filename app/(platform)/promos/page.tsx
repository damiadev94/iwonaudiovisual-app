export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Film, Users, Clock } from "lucide-react";
import Image from "next/image";
import type { Promo, PromoBooking } from "@/types";
import { ReservaButton } from "@/components/platform/ReservaButton";

function formatARS(value: number) {
  return value.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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
    .select("promo_id, booking_token")
    .eq("user_id", user.id);

  const typedPromos = (promos || []) as Promo[];
  const typedBookings = (bookings || []) as Pick<PromoBooking, "promo_id" | "booking_token">[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Promos de filmación</h1>
        <p className="text-muted-foreground">
          Reservá tu sesión a precios exclusivos para suscriptores.
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
            const booking = typedBookings.find((b) => b.promo_id === promo.id);

            return (
              <Card key={promo.id} className="bg-iwon-card border-iwon-border overflow-hidden">
                {/* Cover image */}
                {promo.cover_image_path ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/promo-covers/${promo.cover_image_path}`}
                      alt={promo.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-iwon-card/80 to-transparent" />
                  </div>
                ) : (
                  <div className="h-1 bg-linear-to-r from-gold to-gold-light" />
                )}

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

                  {/* Prices */}
                  <div className="flex items-end gap-3">
                    <p className="text-2xl font-bold font-mono text-gold">
                      {formatARS(promo.price)}
                    </p>
                    {promo.original_price && (
                      <p className="text-sm text-muted-foreground line-through pb-0.5">
                        {formatARS(promo.original_price)}
                      </p>
                    )}
                  </div>

                  {/* Deadline + slots row */}
                  <div className="flex items-center justify-between text-sm">
                    {promo.available_until && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Hasta el {formatFecha(promo.available_until)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 ml-auto">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className={slotsAvailable <= 10 ? "text-iwon-warning font-medium" : ""}>
                        {slotsAvailable}/{promo.max_slots} cupos
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-iwon-bg rounded-full h-2">
                    <div
                      className="bg-gold rounded-full h-2 transition-all"
                      style={{ width: `${Math.min((promo.slots_taken / promo.max_slots) * 100, 100)}%` }}
                    />
                  </div>

                  {/* CTA */}
                  {booking ? (
                    <div className="space-y-2">
                      <Button disabled className="w-full">
                        Ya reservaste esta promo
                      </Button>
                      <p className="text-xs text-center text-muted-foreground font-mono">
                        Código: {booking.booking_token}
                      </p>
                    </div>
                  ) : (
                    <ReservaButton
                      promoId={promo.id}
                      promoTitle={promo.title}
                      isSoldOut={isSoldOut}
                    />
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
