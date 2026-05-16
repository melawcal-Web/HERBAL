import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    /** תמונות עד 5MB — ברירת המחדל של Next היא ~1MB וחותכת העלאות */
    bodySizeLimit: "6mb",
  },
  env: {
    NEXT_PUBLIC_BUILD_TIME_ISO: new Date().toISOString(),
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? "",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "plus.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
