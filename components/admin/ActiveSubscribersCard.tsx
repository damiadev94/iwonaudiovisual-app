"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";

interface ActiveSubscriber {
  id: string;
  status: string;
  plan_amount: number | null;
  created_at: string;
  profiles:
    | { email: string; full_name: string | null; artist_name: string | null }
    | { email: string; full_name: string | null; artist_name: string | null }[]
    | null;
}

const PREVIEW_LIMIT = 5;

export function ActiveSubscribersCard({
  subscribers,
}: {
  subscribers: ActiveSubscriber[];
}) {
  const [open, setOpen] = useState(false);
  const preview = subscribers.slice(0, PREVIEW_LIMIT);

  return (
    <>
      <Card className="bg-iwon-card border-iwon-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg">Suscriptores activos</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            onClick={() => setOpen(true)}
          >
            <Users className="h-3.5 w-3.5" />
            Ver todos ({subscribers.length})
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {preview.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay suscriptores activos.
              </p>
            ) : (
              preview.map((sub) => (
                <SubscriberRow key={sub.id} sub={sub} />
              ))
            )}
            {subscribers.length > PREVIEW_LIMIT && (
              <p className="text-xs text-muted-foreground pt-1">
                +{subscribers.length - PREVIEW_LIMIT} más...
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-iwon-card border-iwon-border max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Suscriptores activos ({subscribers.length})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {subscribers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay suscriptores activos.
              </p>
            ) : (
              subscribers.map((sub) => (
                <SubscriberRow key={sub.id} sub={sub} />
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SubscriberRow({ sub }: { sub: ActiveSubscriber }) {
  const profile = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;
  const name =
    profile?.full_name ||
    profile?.artist_name ||
    profile?.email ||
    "Sin nombre";
  const email = profile?.email ?? "";
  const amount = sub.plan_amount
    ? `$${sub.plan_amount.toLocaleString("es-AR")}`
    : null;

  return (
    <div className="flex items-center justify-between py-2 border-b border-iwon-border last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{email}</p>
      </div>
      <div className="flex items-center gap-2 ml-2 shrink-0">
        {amount && (
          <span className="text-xs text-gold font-mono">{amount}</span>
        )}
        <Badge
          variant="outline"
          className="bg-iwon-success/10 text-iwon-success border-iwon-success/20 text-xs"
        >
          Activa
        </Badge>
      </div>
    </div>
  );
}
