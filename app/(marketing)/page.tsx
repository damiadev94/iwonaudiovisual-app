import { redirect } from "next/navigation";
import { Hero } from "@/components/landing/Hero";
import { Ticker } from "@/components/landing/Ticker";
import { ConceptSection } from "@/components/landing/ConceptSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { PortfolioSection } from "@/components/landing/PortfolioSection";
import { CalendarSection } from "@/components/landing/CalendarSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FooterCTA } from "@/components/landing/FooterCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // OAuth fallback: when /callback is not in the redirect allowlist,
  // the auth code lands here — forward it to the callback handler
  const { code } = await searchParams;
  if (code) redirect(`/callback?code=${code}`);

  return (
    <>
      <Hero />
      <Ticker />
      <ConceptSection />
      <BenefitsSection />
      <PortfolioSection />
      <CalendarSection />
      <PricingSection />
      <FAQSection />
      <FooterCTA />
      <LandingFooter />
    </>
  );
}
