import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = ["/login", "/"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. EXCEPCIÓN PARA MERCADO PAGO
  // Permitimos que esta ruta pase sin verificar usuario ni sesión
  if (pathname.startsWith("/api/webhooks/mercadopago")) {
    return NextResponse.next();
  }

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

  // Verificar role=admin para rutas /admin/* y /api/admin/*
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (user && isAdminRoute) {
    // Usar service role key para bypassear RLS y leer el rol del usuario
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[middleware] Error fetching profile:", profileError.message);
    }

    if (!profile || profile.role !== "admin") {
      // API routes: devolver 403 en vez de redirect HTML
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Pasar el rol verificado como request header para que el layout
    // no necesite hacer otra query a la DB
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    requestHeaders.set("x-user-role", "admin");

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    // Preservar las cookies de sesión que Supabase pudo haber refrescado
    for (const { name, value, ...options } of supabaseResponse.cookies.getAll()) {
      response.cookies.set(name, value, options);
    }

    return response;
  }

  // Para el resto de rutas, también inyectar el pathname
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  
  const finalResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  for (const { name, value, ...options } of supabaseResponse.cookies.getAll()) {
    finalResponse.cookies.set(name, value, options);
  }

  return finalResponse;
}


export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/subir-cancion/:path*",
    "/perfil/:path*",
    "/cursos/:path*",
    "/sorteos/:path*",
    "/promos/:path*",
    "/seleccion/:path*",
    "/suscripcion/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
