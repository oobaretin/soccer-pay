import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/**" },
      { protocol: "https", hostname: "thumb.wikimedia.org", pathname: "/**" },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
