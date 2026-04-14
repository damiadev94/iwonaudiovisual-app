"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Music,
  Film,
  Gift,
  User,
  LogOut,
  X,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cursos", label: "Cursos", icon: BookOpen },
  { href: "/seleccion", label: "Mándanos tu canción", icon: Music },
  { href: "/promos", label: "Promos", icon: Film },
  { href: "/sorteos", label: "Sorteos", icon: Gift },
  { href: "/perfil", label: "Mi Perfil", icon: User },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-iwon-border">
        <Logo />
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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

      {/* Logout */}
      <div className="p-4 border-t border-iwon-border">
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
