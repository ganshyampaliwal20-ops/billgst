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

