import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Fallbacks to prevent Vercel Build/Runtime Errors if user forgets settings
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://billgst.in',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'billgst_security_fallback_secret_key_9988',
  },
  experimental: {
    turbo: {
      root: '.',
    }
  } as any,
};

export default nextConfig;
