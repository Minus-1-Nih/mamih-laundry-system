"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Brand } from "@/components/brand";
import { SiteFooter } from "@/components/shells/site-footer";
import { UserMenu } from "@/components/shells/user-menu";
import { cn } from "@/lib/cn";
import { useCurrentUser } from "@/lib/store";

interface NavLink {
  label: string;
  href: string;
  match: string;
}

function navFor(customer: boolean): NavLink[] {
  return [
    customer
      ? { label: "Riwayat Pesanan", href: "/akun/riwayat", match: "/akun/riwayat" }
      : { label: "Lacak Pesanan", href: "/tracking", match: "/tracking" },
    { label: "Lokasi dan Alamat", href: "/lokasi", match: "/lokasi" },
    { label: "Sesi Operasional", href: "/sesi", match: "/sesi" },
  ];
}

function NavItems({
  customer,
  onNavigate,
  vertical = false,
}: {
  customer: boolean;
  onNavigate?: () => void;
  vertical?: boolean;
}) {
  const pathname = usePathname();

  return (
    <>
      {navFor(customer).map((item) => {
        const active =
          pathname === item.match || pathname.startsWith(`${item.match}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-sm font-medium whitespace-nowrap transition-[background-color,color] duration-[var(--dur-micro)]",
              vertical
                ? "rounded-control px-4 py-2.5"
                : "rounded-control px-3.5 py-2",
              active
                ? "bg-accent text-accent-ink"
                : "text-ink-2 hover:bg-paper-2 hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export interface PublicShellProps {
  children: ReactNode;
  mainClassName?: string;
}

export function PublicShell({ children, mainClassName }: PublicShellProps) {
  const user = useCurrentUser();
  const customer = user?.role === "customer";

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="sticky top-0 z-[var(--z-sticky-nav)] bg-paper">
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-3 sm:px-6 lg:px-16">
          <div className="flex h-16 items-center justify-between gap-3 rounded-control border border-ink bg-paper pr-2 pl-4 shadow-[4px_4px_0_var(--color-paper-3)] sm:pl-5">
            <Brand href="/public" compact />

            <nav
              aria-label="Navigasi utama"
              className="hidden items-center gap-1 rounded-control border border-rule p-1 lg:flex"
            >
              <NavItems customer={customer} />
            </nav>

            <div className="flex items-center gap-2">
              {user ? (
                <UserMenu />
              ) : (
                <>
                  <Link
                    href="/masuk"
                    className="hidden px-2 text-sm font-medium text-ink-2 whitespace-nowrap hover:text-accent sm:block"
                  >
                    Masuk akun
                  </Link>
                  <Link
                    href="/daftar"
                    className="inline-flex h-10 items-center rounded-control border border-accent bg-accent px-3.5 text-sm font-medium whitespace-nowrap text-accent-ink transition-[background-color,border-color] duration-[var(--dur-micro)] hover:border-accent-hover hover:bg-accent-hover"
                  >
                    Daftar
                  </Link>
                </>
              )}

              <details className="group relative lg:hidden">
                <summary className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-control border border-rule px-3.5 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
                  Menu
                  <ChevronDown className="h-4 w-4 text-muted transition-transform duration-[var(--dur-short)] group-open:rotate-180" />
                </summary>
                <div className="absolute right-0 z-[var(--z-dropdown)] mt-2 w-64 rounded-card border-2 border-ink bg-paper p-2 shadow-[6px_6px_0_var(--color-paper-3)]">
                  <div className="flex flex-col gap-1">
                    <NavItems customer={customer} vertical />
                  </div>
                  {!user ? (
                    <Link
                      href="/masuk"
                      className="mt-1 block rounded-control px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper-2"
                    >
                      Masuk akun
                    </Link>
                  ) : null}
                </div>
              </details>
            </div>
          </div>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 sm:px-6 lg:px-16 lg:py-12",
          mainClassName,
        )}
      >
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
