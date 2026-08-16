import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.NEXT_OUTPUT_MODE === "standalone" && {
    output: "standalone" as const,
  }),
};

export default nextConfig;
