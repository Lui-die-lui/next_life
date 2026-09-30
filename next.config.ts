import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pg / Prisma's driver adapter use Node APIs that shouldn't be bundled.
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
};

export default nextConfig;
