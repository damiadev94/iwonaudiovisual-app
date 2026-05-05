import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const [email, password, full_name = "Test User"] = process.argv.slice(2);

if (!email || !password) {
  console.error("Uso: npx tsx scripts/create-test-user.ts <email> <password> [nombre]");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }

  const userId = data.user.id;

  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      { id: userId, email, full_name },
      { onConflict: "id", ignoreDuplicates: true }
    );

  if (profileError) {
    console.error("Usuario creado pero falló el perfil:", profileError.message);
    process.exit(1);
  }

  console.log(`✓ Usuario creado y confirmado`);
  console.log(`  ID:    ${userId}`);
  console.log(`  Email: ${email}`);
}

main();
