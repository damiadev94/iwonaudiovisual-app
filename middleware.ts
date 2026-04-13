import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = ["/login"];

export async function middleware(request: NextRequest) {
  // Inicializar respuesta permitiendo que la request continúe
  let supabaseResponse = NextResponse.next({ request });

  // Crear cliente Supabase con soporte de cookies para refrescar la sesión
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: no usar getSession() — getUser() valida el token contra el servidor
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // /register is no longer a form — always redirect to /login
  if (pathname === "/register") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && AUTH_ROUTES.includes(pathname)) {
    // Usuario autenticado en ruta de auth → redirigir al dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!user && !AUTH_ROUTES.includes(pathname)) {
    // Usuario no autenticado en ruta protegida → redirigir al login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

// Aplica a rutas de auth (para redirigir usuarios ya logueados)
// y a rutas de plataforma/admin (para proteger contenido)
export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/subir-cancion/:path*",
    "/perfil/:path*",
    "/cursos/:path*",
    "/sorteos/:path*",
    "/promos/:path*",
    "/seleccion/:path*",
    "/admin/:path*",
  ],
};
