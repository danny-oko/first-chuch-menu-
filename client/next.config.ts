import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /api/* is handled by app/api/[[...path]]/route.ts → Hono Worker
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
