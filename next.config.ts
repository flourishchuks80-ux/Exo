import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  serverExternalPackages: [
    "@walletconnect/ethereum-provider",
    "@walletconnect/core",
    "@reown/appkit",
    "@reown/appkit-controllers",
  ],
};

export default nextConfig;
