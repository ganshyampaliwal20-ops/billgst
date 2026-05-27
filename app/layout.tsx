import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import SessionWrapper from "@/app/components/SessionWrapper";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "auto",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.billgst.in"),
  title: "BillGST - Free GST Billing & Stock Management",
  description: "Professional GST billing software for small business. Create invoices, manage inventory, and track payments for free.",
  keywords: "free gst bill, billgst, gstbill, invoice generator, billing software, inventory management, small business billing, gst invoice maker",
  verification: {
    google: "vPtda0GcH0gspOZA2hOGpfGpCVkT1e21W1AqfpHxCpw",
  },
  applicationName: "BillGST",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BillGST",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'apple-touch-icon', url: '/apple-icon.png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "BillGST - Free Billing Software",
    description: "Create professional GST invoices for free. Best for small businesses in India.",
    type: "website",
    siteName: 'BillGST',
    url: 'https://www.billgst.in',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'BillGST Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'BillGST - Free GST Billing Software',
    description: 'Professional billing software for Indian small businesses',
    images: ['/logo.png'],
  },
};

import InstallAppBanner from "@/app/components/InstallAppBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning={true}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "BillGST",
              "url": "https://www.billgst.in",
              "logo": "https://www.billgst.in/logo.png",
              "description": "Professional GST billing software for small business. Create invoices, manage inventory, and track payments for free.",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "support@billgst.in",
                "contactType": "customer support"
              }
            })
          }}
        />
        <SessionWrapper>
          {children}
        </SessionWrapper>
        <InstallAppBanner />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
