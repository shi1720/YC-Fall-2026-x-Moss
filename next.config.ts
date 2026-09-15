import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Moss ships a native N-API binding; keep it out of the server bundle.
  serverExternalPackages: ["@moss-js/moss", "@moss-js/moss-core", "ws"],
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
