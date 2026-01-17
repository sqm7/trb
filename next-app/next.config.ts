import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // When deploying to GitHub Pages, uncomment:
  output: 'export',
  basePath: '/trb',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
