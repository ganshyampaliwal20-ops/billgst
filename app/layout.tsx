import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "BillGST - Advanced GST Billing & Inventory Management",
  description: "Complete GST billing solution with inventory management, analytics, and multi-user support",
  keywords: "GST billing, invoice, inventory management, accounting software, India",
  verification: {
    google: "vPtda0GcH0gspOZA2hOGpfGpCVkT1e21W1AqfpHxCpw",
  },
  applicationName: "BillGST",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' }
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: "BillGST - GST Billing & Inventory",
    description: "Professional GST billing and inventory management system",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

