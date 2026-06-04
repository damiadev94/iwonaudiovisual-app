import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Benefits } from "@/components/landing/Benefits";
import { Portfolio } from "@/components/landing/Portfolio";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // OAuth fallback: when /callback is not in the redirect allowlist,
  // the auth code lands here — forward it to the callback handler
  const { code } = await searchParams;
  if (code) {
    redirect(`/callback?code=${code}`);
  }

  // Fetch active full_access promotion (public RLS policy allows this)
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data: activePromos } = await supabase
    .from("promotions")
    .select("name, type, ends_at")
    .eq("is_active", true)
    .eq("type", "full_access")
    .lte("starts_at", now)
    .gte("ends_at", now)
    .limit(1);
  const activeFullAccessPromo = activePromos?.[0] ?? null;

  const promoEndDate = activeFullAccessPromo
    ? new Date(activeFullAccessPromo.ends_at)
    : null;

  return (
    <>
      <Hero promoEndDate={promoEndDate} />
      <HowItWorks />
      <Benefits />
      <Portfolio />
      <Pricing promoEndDate={promoEndDate} />
      <FAQ />
      <CTA promoEndDate={promoEndDate} />
    </>
  );
}
