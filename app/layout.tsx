import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import SessionWrapper from "@/app/components/SessionWrapper";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://billgst.in"),
  title: "BillGST: Free Billing, Inventory, Expense & Staff Management App",
  description: "India's best 100% Free App for Business & Personal use. Manage GST/Non-GST billing, expenses, inventory, staff attendance, and online shop (dukaan).",
  keywords: "free billing software, expense manager app, inventory management, online shop creator, staff attendance app, free gst billing app, invoice maker, vyapar alternative, business accounting app, personal expense tracker, dukaan hisaab, free invoice generator",
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
      { url: '/favicon.ico', sizes: 'any' },
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
    title: "BillGST - All-in-one Business & Expense Manager",
    description: "100% Free App for Billing, Expenses, Inventory & Attendance. Perfect for shops and personal use.",
    type: "website",
    siteName: 'BillGST',
    url: 'https://billgst.in',
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
    title: 'BillGST - Free Business & Expense App',
    description: '100% Free App for Billing, Expenses, Inventory & Staff Management.',
    images: ['/logo.png'],
  },
};

import InstallAppBanner from "@/app/components/InstallAppBanner";
import CapacitorHandler from "@/app/components/CapacitorHandler";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.10.0/tabler-icons.min.css"
          media="print"
          // @ts-ignore
          onLoad="this.media='all'"
        />
        <noscript>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.10.0/tabler-icons.min.css"/>
        </noscript>
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning={true}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "BillGST",
                "url": "https://billgst.in",
                "logo": "https://billgst.in/logo.png",
                "description": "All-in-one business and personal finance app. Create invoices, manage inventory, track expenses, and manage staff attendance for free.",
                "address": {
                  "@type": "PostalAddress",
                  "addressCountry": "IN"
                },
                "contactPoint": {
                  "@type": "ContactPoint",
                  "email": "billgstapp@gmail.com",
                  "contactType": "customer support"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "BillGST Business & Expense App",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web, Android, Windows",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR"
                },
                "description": "Free App for Invoicing, Expense Tracking, Inventory Management, Online Shop and Staff Attendance. Perfect for personal use and small businesses."
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "Is BillGST really free?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes. The app is completely free to use. There are no subscription plans or hidden charges."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Which GST returns can I generate?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "BillGST generates GSTR-1, GSTR-3B, and GSTR-4 reports from your billing data. Download and upload directly to the GST portal, or share with your CA."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How does the camera stock update work?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Click a photo of any product or its barcode. The AI identifies the item and updates the quantity in your inventory — no manual entry needed."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Can I send invoices on WhatsApp?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes. Every invoice can be sent as a PDF directly to any customer's WhatsApp number in one tap — no downloads or email required."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What types of invoices can I create?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Tax invoice, proforma invoice, credit note, debit note, delivery challan — all major invoice formats are supported."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How secure is my data?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "All data is encrypted with AES-256 encryption — the same standard used by banks. Only you can access your shop's data."
                    }
                  }
                ]
              }
            ])
          }}
        />
        <SessionWrapper>
          {children}
        </SessionWrapper>
        <InstallAppBanner />
        <CapacitorHandler />
        <Toaster
          position="top-center"
          containerStyle={{ top: 'calc(env(safe-area-inset-top, 0px) + 60px)' }}
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '14px',
              background: '#1e1e2e',
              color: '#e2e8f0',
              fontSize: '13px',
              fontWeight: '500',
              padding: '12px 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              maxWidth: '320px',
            },
            success: {
              style: {
                background: '#0f2a1e',
                color: '#4ade80',
                border: '1px solid #166534',
              },
              iconTheme: { primary: '#4ade80', secondary: '#0f2a1e' },
            },
            error: {
              style: {
                background: '#2a0f0f',
                color: '#f87171',
                border: '1px solid #991b1b',
              },
              iconTheme: { primary: '#f87171', secondary: '#2a0f0f' },
              duration: 5000,
            },
          }}
        />
      </body>
    </html>
  );
}
