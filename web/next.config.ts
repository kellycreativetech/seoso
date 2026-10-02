import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app is web/ in a repo with its own root package.json. Pin the project root here so Next.js doesn't
  // infer the repo root from the extra lockfile; otherwise Netlify packages the server with the wrong paths
  // and every route 404s.
  turbopack: { root: __dirname },
  outputFileTracingRoot: __dirname,
  images: {
    // Object form: Sanity image URLs carry transform query params (?w=…), which the
    // `new URL()` shorthand would reject.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" }],
  },
};

export default nextConfig;
