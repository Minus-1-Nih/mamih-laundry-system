import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-6 py-6 text-13 text-muted sm:flex-row sm:items-center sm:justify-between lg:px-16">
        <p>© 2026 Laundria. Bersihnya sampai rumah.</p>
        <div className="flex flex-wrap items-center gap-5">
          <Link href="/public" className="hover:text-ink">
            Pusat Bantuan
          </Link>
          <Link href="/public" className="hover:text-ink">
            Kebijakan Privasi
          </Link>
          <Link href="/public" className="hover:text-ink">
            Syarat dan Ketentuan
          </Link>
        </div>
      </div>
    </footer>
  );
}
