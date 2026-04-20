import { redirect } from "next/navigation";
import { Hero } from "@/components/landing/Hero";
import { Ticker } from "@/components/landing/Ticker";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Benefits } from "@/components/landing/Benefits";
import { CalendarSection } from "@/components/landing/CalendarSection";
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

  return (
    <>
      <Hero />
      <Ticker />
      <HowItWorks />
      <Benefits />
      <CalendarSection />
      <Portfolio />
      <Pricing />
      <FAQ />
      <CTA />
    </>
  );
}
