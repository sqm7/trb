import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // When deploying to GitHub Pages, uncomment:
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH !== undefined ? process.env.NEXT_PUBLIC_BASE_PATH : '/trb',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
