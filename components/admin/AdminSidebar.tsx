"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Star,
  Gift,
  BookOpen,
  Film,
  CreditCard,
  LogOut,
  ArrowLeft,
  X,
  Music,
  Images,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/suscriptores", label: "Suscriptores", icon: Users },
  { href: "/admin/canciones", label: "Canciones", icon: Music },
  { href: "/admin/selecciones", label: "Selecciones", icon: Star },
  { href: "/admin/sorteos", label: "Sorteos", icon: Gift },
  { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { href: "/admin/promos", label: "Promos", icon: Film },
  { href: "/admin/pagos", label: "Pagos", icon: CreditCard },
  { href: "/admin/portfolio", label: "Portfolio", icon: Images },
];

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col h-full bg-iwon-bg-secondary border-r border-iwon-border">
      <div className="flex items-center justify-between p-4 border-b border-iwon-border">
        <Logo />
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="px-4 py-2">
        <span className="text-xs text-gold font-semibold uppercase tracking-wider">Admin Panel</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-gold/10 text-gold font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-iwon-card"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-iwon-border space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-iwon-card transition-colors"
        >
          <ArrowLeft size={18} />
          Ir a la plataforma
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-iwon-card w-full transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesion
        </button>
      </div>
    </div>
  );
}
