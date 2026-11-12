import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  MapPin,
  MessageCircle,
  PackageSearch,
  Shirt,
  WashingMachine,
  Wind,
} from "lucide-react";
import { PublicShell } from "@/components/shells/public-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { PublicTrackingForm } from "@/components/public/tracking-form";
import { cn } from "@/lib/cn";
import { SERVICE_HOURS, whatsappLink } from "@/lib/constants";
import { formatTime, maskName } from "@/lib/format";
import { seedOrders, seedSessions, seedZones } from "@/lib/seed";

const preview =
  seedOrders.find((order) => order.code === "Z1-261104-012") ?? seedOrders[0];

const services = [
  {
    icon: WashingMachine,
    name: "Cuci Kering Setrika",
    description:
      "Cucian dicuci, dikeringkan, lalu disetrika. Cocok untuk pakaian harian dan seragam.",
  },
  {
    icon: Wind,
    name: "Cuci Kering",
    description:
      "Cucian dicuci dan dikeringkan tanpa setrika. Untuk bahan yang tidak perlu disetrika.",
  },
  {
    icon: Shirt,
    name: "Setrika",
    description:
      "Layanan setrika untuk pakaian yang sudah dicuci dan siap dirapikan.",
  },
];

const steps = [
  {
    title: "Pesan lewat WhatsApp",
    description:
      "Sampaikan alamat, layanan, dan jadwal penjemputan yang Anda inginkan.",
  },
  {
    title: "Admin menyiapkan pesanan",
    description:
      "Pesanan dicatat, lalu Anda menerima kode unik dan tautan pelacakan.",
  },
  {
    title: "Driver menjemput",
    description:
      "Cucian dijemput sesuai zona alamat dan dibawa ke gerai untuk ditimbang.",
  },
  {
    title: "Lacak sampai diantar",
    description:
      "Pantau setiap perubahan status hingga cucian tiba kembali di rumah.",
  },
];

function PreviewStep({
  state,
  label,
  time,
}: {
  state: "done" | "current" | "pending";
  label: string;
  time: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
          state === "done" && "border-primary bg-primary text-white",
          state === "current" && "border-primary bg-surface text-primary",
          state === "pending" && "border-border bg-surface text-muted",
        )}
      >
        {state === "done" ? (
          <Check className="h-3.5 w-3.5" />
        ) : state === "current" ? (
          <span className="h-2 w-2 rounded-full bg-primary" />
        ) : null}
      </span>
      <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
        <p
          className={cn(
            "text-sm",
            state === "current"
              ? "font-semibold text-primary"
              : state === "done"
                ? "font-medium text-ink"
                : "text-muted",
          )}
        >
          {label}
        </p>
        <p className="shrink-0 text-13 text-muted">{time}</p>
      </div>
    </li>
  );
}

export default function PublicPage() {
  const pickup = seedSessions.find((session) => session.type === "pickup");
  const delivery = seedSessions.find((session) => session.type === "delivery");

  return (
    <PublicShell>
      <section className="overflow-hidden rounded-2xl bg-secondary">
        <div className="grid items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16 lg:px-12 lg:py-14">
          <div>
            <h1 className="max-w-2xl text-balance text-[40px] font-bold leading-[1.08] tracking-[-0.03em] text-ink sm:text-5xl lg:text-[52px]">
              Cucian bersih, kembali tanpa repot.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
              Antar jemput laundry di Sukabirus, Sukapura, dan Ciganitri. Pantau
              setiap tahap sampai cucian tiba di rumah.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={whatsappLink(
                  "Halo Laundria, saya ingin pesan antar-jemput laundry.",
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                <MessageCircle className="h-4 w-4" />
                Pesan lewat WhatsApp
              </a>
              <Link
                href="/tracking"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-medium text-ink transition-colors hover:bg-canvas"
              >
                Lacak pesanan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="mt-5 flex items-center gap-2 text-13 text-muted">
              <Clock3 className="h-4 w-4 text-primary" />
              Buka setiap hari, {SERVICE_HOURS}.
            </p>
          </div>

          <div>
            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-13 font-medium text-muted">
                    Pratinjau pelacakan
                  </p>
                  <p className="mt-1 font-mono text-base font-semibold tracking-tight text-ink">
                    {preview.code}
                  </p>
                </div>
                <StatusBadge status={preview.status} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-4 text-13 text-muted">
                <span className="font-medium text-ink">
                  {maskName(preview.customerName)}
                </span>
                <span aria-hidden="true">·</span>
                <span>{preview.service}</span>
                <span aria-hidden="true">·</span>
                <span>{preview.weight}</span>
              </div>

              <ol className="mt-5 space-y-3.5">
                <PreviewStep
                  state="done"
                  label="Pesanan diterima"
                  time={`${formatTime(preview.createdAt)} WIB`}
                />
                <PreviewStep
                  state="current"
                  label="Penjemputan"
                  time={`${preview.schedule} WIB`}
                />
                <PreviewStep
                  state="pending"
                  label="Pencucian"
                  time="Setelah dijemput"
                />
                <PreviewStep
                  state="pending"
                  label="Pengantaran"
                  time="17.00–22.00 WIB"
                />
              </ol>

              <Link
                href="/tracking"
                className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
              >
                Lacak pesanan Anda
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-3 px-1 text-13 leading-relaxed text-muted">
              Contoh tampilan pelacakan. Kode asli dikirim Admin lewat WhatsApp.
            </p>
          </div>
        </div>
      </section>

      <section id="layanan" className="mt-20 scroll-mt-28">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Layanan
            </h2>
            <p className="mt-2 text-sm text-muted sm:text-base">
              Pilih perawatan sesuai kebutuhan cucian Anda.
            </p>
          </div>
          <p className="text-13 text-muted">
            Tarif dihitung dari berat saat penimbangan.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.name}
                className="rounded-xl border border-border bg-surface p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-ink">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {service.description}
                </p>
              </article>
            );
          })}
        </div>

        <a
          href={whatsappLink(
            "Halo Laundria, saya ingin bertanya tentang layanan laundry.",
          )}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          <MessageCircle className="h-4 w-4" />
          Tanya layanan lewat WhatsApp
        </a>
      </section>

      <section id="cara-kerja" className="mt-20 scroll-mt-28">
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Cara kerja
        </h2>
        <p className="mt-2 max-w-lg text-sm text-muted sm:text-base">
          Dari pesan pertama sampai cucian kembali ke rumah.
        </p>

        <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-13 font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section id="jangkauan" className="mt-20 scroll-mt-28">
        <div className="grid gap-10 overflow-hidden rounded-2xl bg-ink p-6 text-white sm:p-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-12">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Jangkauan dan jadwal
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/70">
              Kami melayani tiga zona di sekitar gerai Sukabirus. Penjemputan
              dan pengantaran mengikuti zona alamat Anda.
            </p>

            <ul className="mt-7 divide-y divide-white/10 border-y border-white/10">
              {seedZones.map((zone) => (
                <li
                  key={zone.id}
                  className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-13 text-white/50">
                      {zone.id}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {zone.name}
                    </span>
                  </div>
                  <span className="text-13 text-white/60 sm:text-right">
                    {zone.area}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-white/5 p-5">
            <p className="flex items-center gap-2 text-13 font-medium text-white/70">
              <Clock3 className="h-4 w-4" />
              Jam operasional
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-white">
              12.00–22.00
            </p>
            <p className="mt-1 text-13 text-white/60">Setiap hari, WIB</p>

            <dl className="mt-5 space-y-3 border-t border-white/10 pt-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-white/60">Penjemputan</dt>
                <dd className="font-medium text-white">
                  {pickup ? `${pickup.start}–${pickup.end}` : "12.00–17.00"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-white/60">Pengantaran</dt>
                <dd className="font-medium text-white">
                  {delivery ? `${delivery.start}–${delivery.end}` : "17.00–22.00"}
                </dd>
              </div>
            </dl>

            <a
              href={whatsappLink(
                "Halo Laundria, saya ingin pesan antar-jemput laundry.",
              )}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-ink transition-colors hover:bg-white/90"
            >
              <MessageCircle className="h-4 w-4" />
              Pesan antar-jemput
            </a>
          </div>
        </div>
      </section>

      <section className="mt-20">
        <div className="grid gap-6 rounded-2xl border border-border bg-surface p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:p-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Sudah punya kode pesanan?
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              Masukkan kode unik yang Anda terima dari Admin untuk melihat
              status cucian.
            </p>
            <p className="mt-4 hidden items-center gap-2 text-13 text-muted sm:flex">
              <PackageSearch className="h-4 w-4 text-primary" />
              Tanpa masuk akun, bisa dibuka dari mana saja.
            </p>
          </div>
          <PublicTrackingForm />
        </div>
      </section>

      <p className="mt-10 flex items-center justify-center gap-2 text-13 text-muted">
        <MapPin className="h-4 w-4 text-primary" />
        Gerai Laundria Sukabirus, Bojongsoang, Kabupaten Bandung.
      </p>
    </PublicShell>
  );
}
