import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
    remotePatterns: [new URL('https://soundmac1.s3.eu-north-1.amazonaws.com/blogImage/**')],
  },
};

export default nextConfig;
