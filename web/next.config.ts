import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Object form: Sanity image URLs carry transform query params (?w=…), which the
    // `new URL()` shorthand would reject.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" }],
  },
};

export default nextConfig;
