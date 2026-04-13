import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify the session is still valid (validates JWT against Supabase auth server)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Role was already verified by middleware and forwarded as a request header.
  // No additional DB query needed here.
  const headersList = await headers();
  const role = headersList.get("x-user-role");

  if (role !== "admin") redirect("/dashboard");

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
