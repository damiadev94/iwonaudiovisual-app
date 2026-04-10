import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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
    "filmacion",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
