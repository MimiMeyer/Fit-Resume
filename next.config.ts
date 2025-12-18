import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/pages/home",
      },
      {
        source: "/about",
        destination: "/pages/about",
      },
    ];
  },
};

export default nextConfig;
