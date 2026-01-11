import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Fallbacks to prevent Vercel Build/Runtime Errors if user forgets settings
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://billgst.in',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'billgst_security_fallback_secret_key_9988',
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/.well-known/assetlinks.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
