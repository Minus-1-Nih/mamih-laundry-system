import Link from "next/link";
import { ArrowLeft, PencilRuler } from "lucide-react";

export interface ComingSoonProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function ComingSoon({
  title,
  description,
  backHref = "/admin",
  backLabel = "Kembali ke dashboard",
}: ComingSoonProps) {
  return (
    <div>
      <div className="border-b border-rule pb-5">
        <h1 className="screen-title">{title}</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          {description ??
            "Fitur ini belum termasuk dalam cakupan prototipe. Alur utama tetap bisa dicoba dari menu yang ada."}
        </p>
      </div>

      <section className="mt-6 grid gap-5 border-2 border-ink bg-paper-2 p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
        <span className="flex h-12 w-12 items-center justify-center bg-accent text-accent-ink">
          <PencilRuler className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">
            Belum termasuk cakupan prototipe
          </p>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted">
            Halaman ini disiapkan sebagai penanda modul berikutnya. Data dan
            aksi operasional tetap berjalan dari halaman yang sudah tersedia.
          </p>
          <Link
            href={backHref}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent underline decoration-gold underline-offset-4 transition-colors duration-[var(--dur-micro)] hover:text-accent-hover"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
