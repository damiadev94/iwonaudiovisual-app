export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard } from "lucide-react";

const statusLabels: Record<string, string> = {
  approved: "Aprobado",
  pending: "Pendiente",
  rejected: "Rechazado",
  refunded: "Reembolsado",
};

const statusColors: Record<string, string> = {
  approved: "bg-iwon-success/10 text-iwon-success border-iwon-success/20",
  pending: "bg-iwon-warning/10 text-iwon-warning border-iwon-warning/20",
  rejected: "bg-iwon-error/10 text-iwon-error border-iwon-error/20",
  refunded: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default async function PagosPage() {
  const supabase = createAdminClient();

  const { data: payments } = await supabase
    .from("payments")
    .select("*, profiles(full_name, email, artist_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  const typedPayments = (payments || []) as Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    payment_method: string | null;
    mp_payment_id: string | null;
    created_at: string;
    profiles: { full_name: string | null; email: string; artist_name: string | null };
  }>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Pagos</h1>
        <p className="text-muted-foreground">Historial de pagos recibidos.</p>
      </div>

      <Card className="bg-iwon-card border-iwon-border overflow-hidden">
        <div className="rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-iwon-border bg-iwon-bg-secondary">
                <TableHead>Usuario</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Metodo</TableHead>
                <TableHead>ID MP</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No hay pagos registrados.
                  </TableCell>
                </TableRow>
              ) : (
                typedPayments.map((payment) => (
                  <TableRow key={payment.id} className="border-iwon-border">
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">
                          {payment.profiles?.full_name || payment.profiles?.artist_name || "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">{payment.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-bold">
                      ${payment.amount.toLocaleString("es-AR")} {payment.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[payment.status] || ""}>
                        {statusLabels[payment.status] || payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {payment.payment_method || "-"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {payment.mp_payment_id || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString("es-AR")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
