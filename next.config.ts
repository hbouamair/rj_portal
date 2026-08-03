import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd()),
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"],
  },
  async redirects() {
    return [
      {
        source: "/classes",
        destination: "/studios",
        permanent: true,
      },
      {
        source: "/instructors",
        destination: "/studios",
        permanent: true,
      },
      {
        source: "/preview/classes",
        destination: "/preview/studios",
        permanent: false,
      },
      {
        source: "/preview/instructors",
        destination: "/preview/studios",
        permanent: false,
      },
    ];
  },
  images: {
    qualities: [75, 85, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

