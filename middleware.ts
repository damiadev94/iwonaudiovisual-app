import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Inicializar respuesta permitiendo que la request continúe
  let supabaseResponse = NextResponse.next({ request });

  // Crear cliente Supabase con soporte de cookies para refrescar la sesión
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  if (!user) {
    // Usuario no autenticado → redirigir al login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

// Solo aplica a rutas de plataforma y admin — la landing, auth y APIs quedan libres
export const config = {
  matcher: [
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
