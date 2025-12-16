import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "BillGST - Free GST Billing & Stock Management",
  description: "Professional GST billing software for small business. Create invoices, manage inventory, and track payments for free.",
  keywords: "free gst bill, billgst, gstbill, invoice generator, billing software, inventory management, small business billing, gst invoice maker",
  verification: {
    google: "vPtda0GcH0gspOZA2hOGpfGpCVkT1e21W1AqfpHxCpw",
  },
  applicationName: "BillGST",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "BillGST - Free Billing Software",
    description: "Create professional GST invoices for free. Best for small businesses in India.",
    type: "website",
    siteName: 'BillGST',
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

