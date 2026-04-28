export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import { LessonVideoPlayer, type PreloadedVideoState } from "@/components/platform/LessonVideoPlayer";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { generateSignedVideoUrl } from "@/lib/cloudflare-stream";

const categoryLabels: Record<string, string> = {
  negocio: "Negocio",
  audiovisual: "Audiovisual",
  marketing: "Marketing",
  publicidad: "Publicidad",
  estrategias: "Estrategias",
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminClient = createAdminClient();
  const { data: course } = await adminClient
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!course) notFound();

  const releaseAt = course.release_at ? new Date(course.release_at) : null;
  // eslint-disable-next-line react-hooks/purity
  const isUpcoming = releaseAt !== null && releaseAt.getTime() > Date.now();

  // Prefetch video state server-side to eliminate client round-trip on first load
  let preloadedState: PreloadedVideoState | undefined;
  if (course.video_uid) {
    if (isUpcoming && releaseAt) {
      preloadedState = { kind: "countdown", releaseAt: releaseAt.toISOString() };
    } else {
      // Check subscription (mirrors the API route logic)
      const { data: profile } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const isAdmin = profile?.role === "admin";
      let hasAccess = isAdmin;

      if (!isAdmin) {
        const { data: subscription } = await adminClient
          .from("subscriptions")
          .select("status")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();
        hasAccess = !!subscription;
      }

      if (!hasAccess) {
        preloadedState = { kind: "subscription" };
      } else {
        const result = await generateSignedVideoUrl(course.video_uid);
        if (result.ok) {
          preloadedState = { kind: "ready", url: result.url };
        }
        // If signing fails, preloadedState stays undefined → client falls back to useEffect fetch
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline" className="border-gold/20 text-gold">
            {categoryLabels[course.category] || course.category}
          </Badge>
          {isUpcoming && (
            <Badge className="bg-gold text-black border-gold uppercase tracking-widest text-[10px] font-black">
              <Lock className="h-3 w-3 mr-1" />
              Próximamente Testing
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        {course.description && (
          <p className="text-muted-foreground">{course.description}</p>
        )}
        {isUpcoming && releaseAt && (
          <p className="mt-3 text-sm text-gold">
            Estreno:{" "}
            {releaseAt.toLocaleString("es-AR", {
              dateStyle: "long",
              timeStyle: "short",
              timeZone: "America/Argentina/Buenos_Aires",
            })}
          </p>
        )}
      </div>

      {course.video_uid && (
        <LessonVideoPlayer
          publicId={course.video_uid}
          title={course.title}
          preloadedState={preloadedState}
        />
      )}

      {!course.video_uid && (
        <div className="aspect-video rounded-xl bg-iwon-card border border-iwon-border flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Video próximamente disponible.</p>
        </div>
      )}
    </div>
  );
}
