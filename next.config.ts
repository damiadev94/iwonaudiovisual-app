import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite que el dev server acepte requests desde ngrok (y otros orígenes externos)
  // Sin esto, Next.js 15 bloquea el JS y React no hidrata en la página.
  allowedDevOrigins: ["*.ngrok-free.dev", "*.ngrok-free.app", "*.ngrok.io"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
