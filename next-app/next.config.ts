import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Force Webpack to avoid Turbopack panic in this environment
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
