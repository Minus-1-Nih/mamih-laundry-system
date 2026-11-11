import Link from "next/link";
import type { ReactNode } from "react";
import {
  CheckCircle2,
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
}

const copy: Record<AuthMode, AuthCopy> = {
  customer: {
    heading: "Cucian terawat. Waktu Anda kembali.",
    body: "Dijemput, dirawat, lalu diantar kembali. Nikmati hari tanpa memikirkan tumpukan cucian.",
    checks: ["Antar jemput", "Status transparan", "Dirawat sepenuh hati"],
    icon: WashingMachine,
  },
  admin: {
    heading: "Operasional rapi. Tim tenang.",
    body: "Satu tempat untuk memantau pesanan, mengatur status, dan menjaga layanan tetap berjalan.",
    checks: ["Pesanan terpusat", "Status akurat", "Laporan siap"],
    icon: ClipboardList,
  },
  owner: {
    heading: "Kendali penuh. Keputusan cepat.",
    body: "Akses Owner mencakup seluruh operasional, termasuk pengelolaan akun Admin dan Driver.",
    checks: ["Semua zona", "Manajemen akun", "Riwayat lengkap"],
    icon: ShieldCheck,
  },
  driver: {
    heading: "Setiap antar, sampai dengan aman.",
    body: "Tugas penjemputan dan pengantaran yang jelas, dengan status yang bisa diperbarui langsung.",
    checks: ["Tugas jelas", "Rute teratur", "Status langsung"],
    icon: Truck,
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
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between gap-6 px-6 lg:px-16">
          <Brand href="/public" />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
            <Link href="/tracking" className="hover:text-ink">
              Lacak Pesanan
            </Link>
            <Link href="/lokasi" className="hover:text-ink">
              Lokasi dan Alamat
            </Link>
            <Link href="/sesi" className="hover:text-ink">
              Sesi Operasional
            </Link>
          </nav>
          <a
            href={whatsappLink("Halo Laundria, saya butuh bantuan.")}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            Butuh bantuan?
          </a>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1440px] flex-1 gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-16 lg:py-12">
        <div className="order-2 overflow-hidden rounded-2xl border border-border bg-secondary lg:order-1">
          <div className="relative flex h-56 items-center justify-center bg-secondary lg:h-72">
            <div className="absolute h-40 w-40 rounded-full bg-surface/70" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-white shadow-sm">
              <Icon className="h-10 w-10" />
            </div>
          </div>
          <div className="bg-secondary/80 p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-ink">{content.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {content.body}
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {content.checks.map((check) => (
                <li
                  key={check}
                  className="flex items-center gap-1.5 text-13 text-muted"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {check}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="order-1 mx-auto w-full max-w-md lg:order-2">
          <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-6 flex items-center gap-1.5 text-13 text-muted">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Data pribadi Anda aman bersama Laundria.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
