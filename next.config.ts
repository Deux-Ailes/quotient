import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pas de badge de développement : il apparaîtrait dans les captures du simulateur.
  devIndicators: false,
};

export default nextConfig;
