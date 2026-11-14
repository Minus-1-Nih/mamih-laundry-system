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

function SectionHead({
  index,
  title,
  subtitle,
  aside,
}: {
  index: string;
  title: string;
  subtitle?: string;
  aside?: string;
}) {
  return (
    <div className="border-t-2 border-ink pt-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="small-print text-accent">{index}</span>
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
          </div>
          <h2 className="mt-4 font-display text-[clamp(2.25rem,3.7vw,52px)] leading-tight">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>
        {aside ? (
          <p className="small-print max-w-[22ch] text-muted sm:text-right">
            {aside}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function PreviewStep({
  index,
  state,
  label,
  time,
}: {
  index: number;
  state: "done" | "current" | "pending";
  label: string;
  time: string;
}) {
  return (
    <li
      className={cn(
        "grid grid-cols-[2.75rem_minmax(0,1fr)] items-start gap-x-3 border-b border-rule py-2.5 last:border-b-0",
        state === "current" &&
          "bg-accent-soft shadow-[inset_2px_0_0_var(--color-accent)]",
      )}
    >
      <div className="flex items-center gap-2 pt-0.5">
        <span
          aria-hidden="true"
          className={cn(
            "flex h-2.5 w-2.5 shrink-0 items-center justify-center",
            state === "done" && "bg-accent text-accent-ink",
            state === "current" && "border-2 border-accent bg-paper",
            state === "pending" && "border border-rule bg-paper",
          )}
        >
          {state === "done" ? (
            <Check className="h-2 w-2" strokeWidth={3} />
          ) : null}
        </span>
        <span className="small-print text-muted">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 pr-2">
        <p
          className={cn(
            "text-sm",
            state === "current"
              ? "font-semibold text-accent"
              : state === "done"
                ? "font-medium text-ink"
                : "text-muted",
          )}
        >
          {label}
        </p>
        <p className="small-print text-muted">{time}</p>
      </div>
    </li>
  );
}

export default function PublicPage() {
  const pickup = seedSessions.find((session) => session.type === "pickup");
  const delivery = seedSessions.find((session) => session.type === "delivery");

  return (
    <PublicShell>
      <section className="border-y-2 border-ink bg-paper-2">
        <div className="grid items-center gap-10 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12 lg:px-12 lg:py-20">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="small-print text-accent">Jemput-antar</span>
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              <span className="small-print text-muted">Bandung</span>
            </div>
            <h1 className="mt-5 max-w-[15ch] text-[clamp(2.75rem,6vw,4.25rem)] leading-[1.02]">
              Cucian bersih, kembali tanpa repot.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-2 sm:text-lg">
              Antar jemput laundry di Sukabirus, Sukapura, dan Ciganitri,
              dipantau tiap tahap.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={whatsappLink(
                  "Halo Laundria, saya ingin pesan antar-jemput laundry.",
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-accent bg-accent px-6 text-sm font-medium text-accent-ink transition-[background-color,border-color] duration-[var(--dur-micro)] hover:border-accent-hover hover:bg-accent-hover"
              >
                <MessageCircle className="h-4 w-4" />
                Pesan lewat WhatsApp
              </a>
              <Link
                href="/tracking"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-ink px-6 text-sm font-medium text-ink transition-colors duration-[var(--dur-micro)] hover:bg-paper"
              >
                Lacak pesanan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="mt-6 flex items-center gap-2 text-13 text-muted">
              <Clock3 className="h-4 w-4 text-accent" />
              Buka setiap hari, {SERVICE_HOURS}.
            </p>
          </div>

          <figure className="m-0">
            <article className="border-2 border-ink bg-paper shadow-[10px_10px_0_var(--color-paper-3)]">
              <div className="flex items-start justify-between gap-3 border-b-2 border-ink px-4 py-3">
                <div className="min-w-0">
                  <p className="small-print text-muted">Pratinjau pelacakan</p>
                  <p className="mt-1 font-outlier text-lg font-semibold tracking-[0.06em] text-ink">
                    {preview.code}
                  </p>
                </div>
                <StatusBadge status={preview.status} />
              </div>

              <dl className="border-b border-rule px-4 py-1">
                {[
                  ["Pelanggan", maskName(preview.customerName)],
                  ["Layanan", preview.service],
                  ["Berat", preview.weight],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-4 border-b border-rule py-2 last:border-b-0"
                  >
                    <dt className="small-print text-muted">{label}</dt>
                    <dd className="text-right text-13 text-ink">{value}</dd>
                  </div>
                ))}
              </dl>

              <ol className="px-4 py-2">
                <PreviewStep
                  index={0}
                  state="done"
                  label="Pesanan diterima"
                  time={`${formatTime(preview.createdAt)} WIB`}
                />
                <PreviewStep
                  index={1}
                  state="current"
                  label="Penjemputan"
                  time={`${preview.schedule} WIB`}
                />
                <PreviewStep
                  index={2}
                  state="pending"
                  label="Pencucian"
                  time="Setelah dijemput"
                />
                <PreviewStep
                  index={3}
                  state="pending"
                  label="Pengantaran"
                  time="17.00-22.00 WIB"
                />
              </ol>

              <Link
                href="/tracking"
                className="flex items-center justify-between gap-4 border-t-2 border-ink px-4 py-3 text-sm font-medium text-accent transition-colors duration-[var(--dur-micro)] hover:text-accent-hover"
              >
                Lacak pesanan Anda
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
            <figcaption className="mt-3 max-w-[36ch] text-13 leading-relaxed text-muted">
              Contoh tampilan pelacakan. Kode asli dikirim Admin lewat WhatsApp.
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="layanan" className="mt-16 scroll-mt-28 sm:mt-24">
        <SectionHead
          index="01"
          title="Layanan"
          subtitle="Pilih perawatan sesuai kebutuhan cucian Anda."
          aside="Tarif dihitung dari berat saat penimbangan."
        />

        <div className="mt-8 grid border-t border-rule md:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <article
                key={service.name}
                className="border-b border-rule py-6 md:border-r md:px-6 md:last:border-r-0 md:first:pl-0 md:last:pr-0"
              >
                <div className="flex items-center gap-4">
                  <span className="small-print text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span aria-hidden="true" className="h-px flex-1 bg-rule" />
                </div>
                <h3 className="mt-6 flex items-center gap-2.5 text-lg font-medium text-ink">
                  <Icon className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
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
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent underline decoration-gold underline-offset-4 transition-colors duration-[var(--dur-micro)] hover:text-accent-hover"
        >
          <MessageCircle className="h-4 w-4" />
          Tanya layanan lewat WhatsApp
        </a>
      </section>

      <section id="cara-kerja" className="mt-16 scroll-mt-28 sm:mt-24">
        <SectionHead
          index="02"
          title="Cara kerja"
          subtitle="Dari pesan pertama sampai cucian kembali ke rumah."
        />

        <ol className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t border-rule pt-4">
              <div className="flex items-center gap-2.5">
                <span className="small-print text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span aria-hidden="true" className="h-px w-6 bg-gold" />
              </div>
              <h3 className="mt-6 text-base font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="jangkauan"
        className="mt-16 scroll-mt-28 border-y-2 border-ink bg-ink text-paper sm:mt-24"
      >
        <div className="grid gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-12 lg:py-14">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="small-print text-paper/60">03</span>
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
            </div>
            <h2 className="mt-4 font-display text-[clamp(2.25rem,3.7vw,52px)] leading-tight">
              Jangkauan dan jadwal
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-paper/70">
              Kami melayani tiga zona di sekitar gerai Sukabirus. Penjemputan
              dan pengantaran mengikuti zona alamat Anda.
            </p>

            <ul className="mt-8 border-t border-paper/20">
              {seedZones.map((zone) => (
                <li
                  key={zone.id}
                  className="flex flex-col gap-1 border-b border-paper/20 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="small-print w-6 shrink-0 text-paper/50">
                      {zone.id}
                    </span>
                    <span className="text-sm font-medium text-paper">
                      {zone.name}
                    </span>
                  </div>
                  <span className="text-13 text-paper/60 sm:text-right">
                    {zone.area}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-paper/30 p-5">
            <p className="flex items-center gap-2 text-13 font-medium text-paper/70">
              <Clock3 className="h-4 w-4" />
              Jam operasional
            </p>
            <p className="mt-3 font-display text-4xl leading-none text-paper">
              12.00-22.00
            </p>
            <p className="mt-2 text-13 text-paper/60">Setiap hari, WIB</p>

            <dl className="mt-6 space-y-3 border-t border-paper/20 pt-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-paper/60">Penjemputan</dt>
                <dd className="font-medium text-paper">
                  {pickup ? `${pickup.start}-${pickup.end}` : "12.00-17.00"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-paper/60">Pengantaran</dt>
                <dd className="font-medium text-paper">
                  {delivery ? `${delivery.start}-${delivery.end}` : "17.00-22.00"}
                </dd>
              </div>
            </dl>

            <a
              href={whatsappLink(
                "Halo Laundria, saya ingin pesan antar-jemput laundry.",
              )}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-pill bg-paper px-4 text-sm font-medium text-ink transition-colors duration-[var(--dur-micro)] hover:bg-paper-2"
            >
              <MessageCircle className="h-4 w-4" />
              Pesan antar-jemput
            </a>
          </div>
        </div>
      </section>

      <section className="mt-16 sm:mt-24">
        <div className="grid gap-8 border-t-2 border-ink pt-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:gap-16">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="small-print text-accent">04</span>
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
            </div>
            <h2 className="mt-4 font-display text-[clamp(2.25rem,3.7vw,52px)] leading-tight">
              Sudah punya kode pesanan?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              Masukkan kode unik yang Anda terima dari Admin untuk melihat
              status cucian.
            </p>
            <p className="mt-5 flex items-center gap-2 text-13 text-muted">
              <PackageSearch className="h-4 w-4 text-accent" />
              Tanpa masuk akun, bisa dibuka dari mana saja.
            </p>
          </div>
          <div className="border-2 border-ink bg-paper p-5 shadow-[6px_6px_0_var(--color-paper-3)]">
            <PublicTrackingForm />
          </div>
        </div>
      </section>

      <p className="mt-12 flex items-center justify-center gap-2 border-t border-rule pt-6 text-13 text-muted">
        <MapPin className="h-4 w-4 text-accent" />
        Gerai Laundria Sukabirus, Bojongsoang, Kabupaten Bandung.
      </p>
    </PublicShell>
  );
}
