import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { CourseExplorer } from "@/components/platform/CourseExplorer";

export const dynamic = "force-dynamic";

export default async function CursosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Use Admin Client to fetch subscription status for the explorer
  const adminClient = createAdminClient();
  const { data: subscription } = await adminClient
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const userProps = {
    id: user.id,
    subscriptionStatus: subscription?.status || "inactive",
  };

  return (
    <div className="h-full space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Cursos y Formación
        </h1>
        <p className="text-muted-foreground">
          Explora nuestro catálogo de contenido exclusivo y potencia tu carrera musical.
        </p>
      </div>

      <CourseExplorer user={userProps} />
    </div>
  );
}
