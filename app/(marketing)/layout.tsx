import { LandingNavbar } from "@/components/landing/LandingNavbar";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="landing"
      style={{
        background: "#080808",
        color: "#F2EDE4",
        fontFamily: "var(--font-body, sans-serif)",
        overflowX: "hidden",
      }}
    >
      <LandingNavbar />
      <main>{children}</main>
    </div>
  );
}
