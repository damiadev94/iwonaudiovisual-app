import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  // SUPABASE_SERVICE_ROLE_KEY es el JWT de service role — necesario para que
  // PostgREST pueda bypassear RLS en operaciones de base de datos.
  // El formato sb_secret_* (SUPABASE_SECRET_KEY) no es decodificable como JWT
  // y PostgREST lo trata como anon, por lo que UPDATE/SELECT quedan bloqueados por RLS.
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
