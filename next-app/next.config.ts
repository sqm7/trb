import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
