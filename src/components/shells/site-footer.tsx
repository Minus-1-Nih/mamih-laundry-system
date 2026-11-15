import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-ink bg-paper">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-10 lg:px-16">
        <p className="font-display max-w-xl text-3xl leading-tight text-ink">
          Bersihnya sampai rumah.
        </p>
        <div className="mt-6 flex flex-col gap-4 border-t border-rule pt-5 text-13 text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Laundria. Laundry jemput-antar Sukabirus, Sukapura, Ciganitri.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="/public#layanan"
              className="whitespace-nowrap text-ink-2 hover:text-accent"
            >
              Layanan
            </Link>
            <Link
              href="/public#cara-kerja"
              className="whitespace-nowrap text-ink-2 hover:text-accent"
            >
              Cara kerja
            </Link>
            <Link
              href="/public#jangkauan"
              className="whitespace-nowrap text-ink-2 hover:text-accent"
            >
              Jangkauan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
