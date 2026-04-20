import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const barlow = Barlow({
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="es" className={`${barlow.variable} ${barlowCondensed.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
