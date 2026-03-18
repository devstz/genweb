import type { NextConfig } from "next";

const API_BACKEND_URL =
  process.env.API_BACKEND_URL ||
  process.env.API_URL ||
  "http://bot_api:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const backendBase = API_BACKEND_URL.replace(/\/$/, "");

    return [
      {
        source: "/api/proxy/:path*",
        destination: `${backendBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
