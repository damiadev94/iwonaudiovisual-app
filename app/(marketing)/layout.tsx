import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("promotions")
    .select("id")
    .eq("is_active", true)
    .eq("type", "full_access")
    .lte("starts_at", now)
    .gte("ends_at", now)
    .limit(1);
  const isPromoActive = (data?.length ?? 0) > 0;

  return (
    <>
      <Navbar isPromoActive={isPromoActive} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
