import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Replicate's primary delivery CDN (generated image URLs)
      { protocol: "https", hostname: "replicate.delivery" },
      // Replicate's upload/input storage
      { protocol: "https", hostname: "pbxt.replicate.delivery" },
    ],
  },
};

export default nextConfig;
