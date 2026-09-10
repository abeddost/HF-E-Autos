import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.mobile.de" },
      { protocol: "https", hostname: "**.classistatic.de" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/fahrzeuge", destination: "/unsere-angebote", permanent: true },
      { source: "/angebote", destination: "/unsere-angebote", permanent: true },
    ];
  },
};

export default nextConfig;
