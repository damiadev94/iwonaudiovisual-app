import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 bg-iwon-bg relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Tu música merece ser vista.{" "}
          <span className="text-gold">Nosotros la filmamos.</span>
        </h2>
        <Link href="/register">
          <Button size="lg" className="bg-gold hover:bg-gold-light text-black font-bold text-lg px-10 py-6 h-auto">
            Suscribite por $14.999/mes
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>

        <p className="mt-4 text-sm text-muted-foreground">
          Cancelá cuando quieras.
        </p>
      </div>
    </section>
  );
}
