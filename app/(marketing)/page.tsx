import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Benefits } from "@/components/landing/Benefits";
import { Portfolio } from "@/components/landing/Portfolio";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Benefits />
      <Portfolio />
      <Pricing />
      <FAQ />
      <CTA />
    </>
  );
}
