"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Search, PowerOff, Power } from "lucide-react";
import type { Profile, Subscription } from "@/types";

interface SubscriberWithSub
  extends Pick<Profile, "id" | "email" | "full_name" | "artist_name" | "role" | "is_active" | "created_at"> {
  subscriptions: Pick<Subscription, "id" | "status">[];
}

const subStatusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: "Activa",
    className: "bg-iwon-success/10 text-iwon-success border-iwon-success/20",
  },
  pending: {
    label: "Pendiente",
    className: "bg-iwon-warning/10 text-iwon-warning border-iwon-warning/20",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-iwon-error/10 text-iwon-error border-iwon-error/20",
  },
  paused: {
    label: "Pausada",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  expired: {
    label: "Expirada",
    className: "bg-muted/10 text-muted-foreground border-muted/20",
  },
};

const roleConfig: Record<string, { label: string; className: string }> = {
  admin: {
    label: "Admin",
    className: "bg-gold/10 text-gold border-gold/20",
  },
  moderator: {
    label: "Moderador",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  user: {
    label: "Usuario",
    className: "bg-muted/10 text-muted-foreground border-muted/20",
  },
};

export function SubscriberTable({
  subscribers: initial,
}: {
  subscribers: SubscriberWithSub[];
}) {
  const [subscribers, setSubscribers] = useState(initial);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return subscribers;
    return subscribers.filter(
      (s) =>
        s.email.toLowerCase().includes(q) ||
        s.full_name?.toLowerCase().includes(q) ||
        s.artist_name?.toLowerCase().includes(q)
    );
  }, [subscribers, search]);

  async function handleRoleChange(userId: string, newRole: string) {
    setLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al cambiar el rol");
        return;
      }
      setSubscribers((prev) =>
        prev.map((s) =>
          s.id === userId ? { ...s, role: newRole as Profile["role"] } : s
        )
      );
      toast.success("Rol actualizado");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleToggleActive(userId: string) {
    setLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}/toggle`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al cambiar el estado");
        return;
      }
      setSubscribers((prev) =>
        prev.map((s) => (s.id === userId ? { ...s, is_active: data.is_active } : s))
      );
      toast.success(data.is_active ? "Usuario activado" : "Usuario desactivado");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-iwon-bg border-iwon-border"
        />
      </div>

      <div className="rounded-xl border border-iwon-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-iwon-border bg-iwon-bg-secondary">
              <TableHead>Usuario</TableHead>
              <TableHead>Nombre artistico</TableHead>
              <TableHead>Suscripcion</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Registro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-10"
                >
                  {search ? "Sin resultados para esa búsqueda." : "No hay usuarios registrados."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sub) => {
                const latestSub = sub.subscriptions?.[0];
                const subStatus = latestSub?.status ?? "none";
                const subConfig = subStatusConfig[subStatus];
                const role = roleConfig[sub.role] ?? roleConfig.user;
                const isLoading = loadingId === sub.id;

                return (
                  <TableRow
                    key={sub.id}
                    className={`border-iwon-border transition-opacity ${
                      !sub.is_active ? "opacity-50" : ""
                    }`}
                  >
                    <TableCell>
                      <p className="font-medium text-sm">
                        {sub.full_name || "Sin nombre"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sub.email}
                      </p>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {sub.artist_name || "-"}
                    </TableCell>

                    <TableCell>
                      {subConfig ? (
                        <Badge variant="outline" className={subConfig.className}>
                          {subConfig.label}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sin suscripcion
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Select
                        value={sub.role}
                        onValueChange={(v) => v && handleRoleChange(sub.id, v)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-7 w-32 text-xs bg-iwon-bg border-iwon-border">
                          <SelectValue>
                            <Badge
                              variant="outline"
                              className={role.className}
                            >
                              {role.label}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-iwon-card border-iwon-border">
                          <SelectItem value="user">Usuario</SelectItem>
                          <SelectItem value="moderator">Moderador</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-7 w-7 p-0 ${
                          sub.is_active
                            ? "text-iwon-success hover:text-iwon-error"
                            : "text-iwon-error hover:text-iwon-success"
                        }`}
                        disabled={isLoading}
                        onClick={() => handleToggleActive(sub.id)}
                        title={sub.is_active ? "Desactivar usuario" : "Activar usuario"}
                      >
                        {sub.is_active ? (
                          <Power className="h-4 w-4" />
                        ) : (
                          <PowerOff className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(sub.created_at).toLocaleDateString("es-AR")}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} de {subscribers.length} usuarios
      </p>
    </div>
  );
}
