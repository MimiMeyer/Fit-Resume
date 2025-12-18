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
      {
        source: "/create-resume",
        destination: "/pages/create-resume",
      },
    ];
  },
};

export default nextConfig;
