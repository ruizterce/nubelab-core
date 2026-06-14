import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
  async rewrites() {
    const apiBase = process.env.API_BASE_URL ?? "http://127.0.0.1:4000";
    return [
      {
        source: "/api/monitor/:path*",
        destination: `${apiBase}/api/v1/:path*`,
      },
    ];
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

export default withMDX(nextConfig);
