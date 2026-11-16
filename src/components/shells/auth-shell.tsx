import Link from "next/link";
import type { ReactNode } from "react";
import {
  Check,
  ClipboardList,
  ShieldCheck,
  Truck,
  WashingMachine,
  type LucideIcon,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { SiteFooter } from "@/components/shells/site-footer";
import { whatsappLink } from "@/lib/constants";

export type AuthMode = "customer" | "admin" | "owner" | "driver";

interface AuthCopy {
  heading: string;
  body: string;
  checks: string[];
  icon: LucideIcon;
  label: string;
}

const copy: Record<AuthMode, AuthCopy> = {
  customer: {
    heading: "Cucian terawat. Waktu Anda kembali.",
    body: "Dijemput, dirawat, lalu diantar kembali. Nikmati hari tanpa memikirkan tumpukan cucian.",
    checks: ["Antar jemput", "Status transparan", "Dirawat sepenuh hati"],
    icon: WashingMachine,
    label: "Masuk pelanggan",
  },
  admin: {
    heading: "Operasional rapi. Tim tenang.",
    body: "Satu tempat untuk memantau pesanan, mengatur status, dan menjaga layanan tetap berjalan.",
    checks: ["Pesanan terpusat", "Status akurat", "Laporan siap"],
    icon: ClipboardList,
    label: "Masuk admin",
  },
  owner: {
    heading: "Kendali penuh. Keputusan cepat.",
    body: "Akses Owner mencakup seluruh operasional, termasuk pengelolaan akun Admin dan Driver.",
    checks: ["Semua zona", "Manajemen akun", "Riwayat lengkap"],
    icon: ShieldCheck,
    label: "Masuk owner",
  },
  driver: {
    heading: "Setiap antar, sampai dengan aman.",
    body: "Tugas penjemputan dan pengantaran yang jelas, dengan status yang bisa diperbarui langsung.",
    checks: ["Tugas jelas", "Rute teratur", "Status langsung"],
    icon: Truck,
    label: "Masuk driver",
  },
};

export interface AuthShellProps {
  mode: AuthMode;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthShell({ mode, title, subtitle, children }: AuthShellProps) {
  const content = copy[mode];
  const Icon = content.icon;

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="border-b border-rule">
        <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-16">
          <Brand href="/public" />
          <div className="flex items-center gap-5">
            <Link
              href="/tracking"
              className="hidden text-sm font-medium text-ink-2 whitespace-nowrap hover:text-accent md:block"
            >
              Lacak pesanan
            </Link>
            <a
              href={whatsappLink("Halo Laundria, saya butuh bantuan.")}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium whitespace-nowrap text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
            >
              Butuh bantuan?
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1240px] flex-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:items-start lg:gap-20 lg:px-8 lg:py-16">
        <div className="order-1 w-full max-w-md">
          <p className="small-print text-accent">{content.label}</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.04] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 flex items-start gap-2 border-t border-rule pt-4 text-13 text-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            Data pribadi Anda aman bersama Laundria.
          </p>
        </div>

        <aside className="order-2 border-2 border-ink bg-paper-2 shadow-[10px_10px_0_var(--color-paper-3)]">
          <div className="gold-rule mx-5 sm:mx-8" />
          <div className="p-6 sm:p-8">
            <span className="flex h-12 w-12 items-center justify-center bg-accent text-accent-ink">
              <Icon className="h-6 w-6" />
            </span>
            <h2 className="mt-6 font-display text-3xl font-normal leading-tight sm:text-4xl">
              {content.heading}
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-2">
              {content.body}
            </p>
            <ul className="mt-7 border-t border-rule">
              {content.checks.map((check, index) => (
                <li
                  key={check}
                  className="flex items-center gap-3 border-b border-rule py-3 text-sm text-ink"
                >
                  <span className="small-print w-6 shrink-0 text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Check className="h-4 w-4 shrink-0 text-accent" />
                  {check}
                </li>
              ))}
            </ul>
            <p className="small-print mt-6 text-muted">
              Laundria · Sukabirus, Sukapura, Ciganitri
            </p>
          </div>
        </aside>
      </main>

      <SiteFooter />
    </div>
  );
}
