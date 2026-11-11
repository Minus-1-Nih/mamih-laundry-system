import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

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
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
        <Construction className="h-5 w-5" />
      </div>
      <h1 className="text-xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">
        {description ??
          "Halaman ini belum tersedia di prototipe. Alur utamanya sudah bisa dicoba dari menu yang ada."}
      </p>
      <Link
        href={backHref}
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
    </div>
  );
}
