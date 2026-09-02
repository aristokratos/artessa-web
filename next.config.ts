import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // The service worker only gets in the way during development, and a stale
  // cached shell is the single most confusing local-dev failure mode.
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Render runs this as a Docker image; standalone output keeps that image
  // small by tracing only the files actually imported.
  output: "standalone",
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Artwork media is served from the S3-compatible bucket, not from /public.
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.cloudflarestorage.com" },
    ],
  },
  // three.js ships untranspiled ESM that Next needs to process itself.
  transpilePackages: ["three"],
};

export default withSerwist(nextConfig);
