import type { Metadata } from "next";
import { Archivo, Archivo_Narrow, Baloo_2, Fraunces } from "next/font/google";
import { StoreProvider } from "@/components/providers/store-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-fraunces",
  display: "swap",
});

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: "800",
  variable: "--font-baloo",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${baloo.variable} ${archivo.variable} ${archivoNarrow.variable}`}
    >
      <body className="min-h-screen bg-paper text-ink antialiased">
        <StoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
