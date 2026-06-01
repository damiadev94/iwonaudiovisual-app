import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Permanent_Marker, Barlow, Barlow_Condensed } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const permanentMarker = Permanent_Marker({
  variable: "--font-graffiti",
  subsets: ["latin"],
  weight: "400",
});

const barlow = Barlow({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-condensed",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Iwon Audiovisual | Impulso para artistas urbanos",
  description:
    "Vamos a seleccionar a los 50 mejores artistas y filmarles su disco. Con equipamiento de cine. Plataforma de impulso para artistas urbanos independientes en Argentina.",
  keywords: [
    "productora audiovisual",
    "artistas urbanos",
    "videoclips",
    "trap",
    "rap",
    "Argentina",
    "filmación",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} ${permanentMarker.variable} ${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
