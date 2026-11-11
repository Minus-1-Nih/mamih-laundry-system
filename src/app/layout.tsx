import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Laundria - Smart Laundry Management System",
  description: "Platform Manajemen Laundry Terintegrasi Multi-Role (ERP, Driver, Pelanggan)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-brand-bg text-brand-text antialiased">
        {children}
      </body>
    </html>
  );
}
