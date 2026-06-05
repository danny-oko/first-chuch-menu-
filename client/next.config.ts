import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Monorepo: app lives in client/, deps may resolve from repo root on Vercel
  outputFileTracingRoot: path.join(rootDir, ".."),
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
