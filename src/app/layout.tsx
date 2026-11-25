import type { Metadata } from "next";
import {
  Archivo,
  Archivo_Narrow,
  Yeseva_One,
} from "next/font/google";
import { StoreProvider } from "@/components/providers/store-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const yeseva = Yeseva_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-yeseva",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-archivo",
  display: "swap",
});

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-archivo-narrow",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Laundria, Laundry Jemput-Antar",
  description:
    "Sistem informasi layanan jemput-antar Mamih Laundry: admin, driver, dan pelacakan pelanggan.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${yeseva.variable} ${archivo.variable} ${archivoNarrow.variable}`}
    >
      <body className="min-h-screen bg-paper text-ink antialiased">
        <StoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
