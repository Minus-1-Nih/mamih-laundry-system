"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  MapPin,
  MessageSquareText,
  PackageSearch,
  Radar,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  WashingMachine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatDateTime,
  maskName,
  orderDate,
  scheduleDateLabel,
  tierLabel,
} from "@/lib/format";
import { sessionWindowLabel } from "@/lib/sessions";
import { useAppStore } from "@/lib/store";
import {
  CustomerOrderProgress,
  orderArrivalLabel,
} from "@/components/customer/order-progress";
import type { Order, OrderStatus } from "@/lib/types";

const statusSentence: Record<OrderStatus, string> = {
  menunggu: "Pesanan Anda sedang menunggu penjemputan.",
  dicuci: "Pakaian Anda sedang kami bersihkan dengan sepenuh hati.",
  siap: "Cucian Anda sudah siap diantar.",
  selesai: "Cucian Anda telah tiba dengan selamat.",
};

function lastUpdated(order: Order): string {
  const event = order.history[order.history.length - 1];
  return event ? `${formatDateTime(event.at)} WIB` : "Belum ada pembaruan";
}

function HeroPanel() {
  const checks = [
    { icon: Sparkles, label: "Dirawat sepenuh hati" },
    { icon: CheckCircle2, label: "Status transparan" },
  ];

  return (
    <aside className="border border-rule bg-paper-2">
      <div className="gold-rule mx-6" />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-14 w-14 items-center justify-center bg-accent text-accent-ink">
            <WashingMachine className="h-7 w-7" strokeWidth={1.5} />
          </span>
          <span className="small-print text-muted">Laundria</span>
        </div>

        <ul className="mt-8 border-t border-ink">
          {checks.map((check, index) => {
            const Icon = check.icon;
            return (
              <li
                key={check.label}
                className="flex items-center gap-3 border-b border-rule py-3.5"
              >
                <span className="small-print w-6 shrink-0 text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon className="h-4 w-4 shrink-0 text-accent" />
                <span className="text-sm text-ink">{check.label}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 border-t-2 border-ink pt-4">
          <p className="font-display text-2xl leading-tight">
            Bersihnya sampai rumah.
          </p>
          <p className="mt-2 text-13 leading-relaxed text-muted">
            Dirawat dengan hati, diantar dengan pasti.
          </p>
        </div>
      </div>
    </aside>
  );
}

function Landing({ onSearch }: { onSearch: (code: string) => void }) {
  const [code, setCode] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(code);
  }

  const steps = [
    {
      icon: MessageSquareText,
      title: "Terima kode dan tautan",
      body: "Kode dan tautan pelacakan dikirim otomatis melalui template WhatsApp setelah Admin menekan “Simpan dan Kirim Kode”.",
    },
    {
      icon: MapPin,
      title: "Buka tautan atau masukkan kode",
      body: "Buka tautan dari WhatsApp atau masukkan kode lengkap pada halaman ini.",
    },
    {
      icon: Radar,
      title: "Pantau status sampai pengantaran",
      body: "Ikuti setiap tahap, dari penjemputan hingga pengantaran, tanpa perlu masuk akun.",
    },
  ];

  return (
    <div>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
        <div className="max-w-xl">
          <div className="flex items-center gap-2.5">
            <span className="small-print text-accent">Pelacakan publik</span>
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            <span className="small-print text-muted">Tanpa masuk akun</span>
          </div>

          <h1 className="mt-5 max-w-[14ch] font-display text-4xl leading-[1.03] sm:text-5xl">
            Cucian Anda sampai di tahap mana?
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
            Dari penjemputan hingga pengantaran. Masukkan Kode Unik Pesanan
            untuk memantau status cucian tanpa perlu masuk akun.
          </p>

          <div className="mt-8 border-2 border-ink bg-paper p-5 shadow-[6px_6px_0_var(--color-paper-3)]">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <label
                  htmlFor="tracking-code"
                  className="block text-sm font-medium text-ink"
                >
                  Kode Unik Pesanan
                </label>
                <Input
                  id="tracking-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Z1-261104-012"
                  className="h-12 font-outlier "
                  autoComplete="off"
                />
              </div>
              <Button type="submit" size="lg" className="shrink-0">
                Lacak pesanan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-3 border-t border-rule pt-3 text-13 text-muted">
              Periksa pesan WhatsApp dari Laundria untuk menemukan Kode Unik
              Pesanan Anda.
            </p>
          </div>

          <p className="mt-5 flex items-center gap-2 text-13 text-muted">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Aman dan praktis. Detail pribadi Anda tetap terlindungi.
          </p>
        </div>

        <HeroPanel />
      </div>

      <section className="mt-16">
        <div className="border-t-2 border-ink pt-4">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="small-print text-accent">01</span>
                <span aria-hidden="true" className="h-px w-8 bg-gold" />
              </div>
              <h2 className="mt-3">
                Tiga langkah, tetap tenang.
              </h2>
            </div>
            <Link
              href="/lokasi"
              className="text-sm font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
            >
              Belum menerima kode? Hubungi Laundria
            </Link>
          </div>
        </div>

        <ol className="mt-6 grid gap-x-8 gap-y-8 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="border-t border-rule pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="small-print text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon className="h-5 w-5 text-ink-2" aria-hidden="true" />
                </div>
                <p className="mt-6 text-sm font-semibold text-ink">
                  {step.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function Result({ order, onSearch }: { order: Order; onSearch: (code: string) => void }) {
  const zones = useAppStore((state) => state.zones);
  const sessions = useAppStore((state) => state.sessions);
  const [code, setCode] = useState(order.code);
  const zone = zones.find((item) => item.id === order.zoneId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(code);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
        <div className="min-w-0">
          <p className="small-print text-accent">Pelacakan pesanan</p>
          <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
            Kabar terbaru cucian Anda.
          </h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-md gap-2 sm:w-auto"
        >
          <div className="relative min-w-0 flex-1">
            <PackageSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              aria-label="Kode unik pesanan"
              className="pl-9 font-outlier "
            />
          </div>
          <Button type="submit" className="shrink-0">
            Periksa
          </Button>
        </form>
      </div>

      <section className="mt-6 flex flex-wrap items-start justify-between gap-6 border-2 border-ink bg-paper-2 p-5 shadow-[6px_6px_0_var(--color-paper-3)]">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-accent text-accent-ink">
            <ReceiptText className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="font-outlier text-sm font-semibold text-ink">
                {order.code}
              </p>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-2 max-w-lg text-lg font-medium leading-snug text-ink">
              {statusSentence[order.status]}
            </p>
            <p className="small-print mt-1.5 text-muted">
              Terakhir diperbarui {lastUpdated(order)}
            </p>
          </div>
        </div>
        <div className="border-t border-rule pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 sm:text-right">
          <p className="small-print text-accent">Estimasi tiba di alamat</p>
          <p className="mt-1 font-display text-2xl leading-tight">
            {orderArrivalLabel(order)}
          </p>
          <p className="small-print mt-1 text-muted">
            Sesi pengantaran, {sessionWindowLabel("delivery", sessions)}
          </p>
        </div>
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="border border-rule bg-paper p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2>
              Perjalanan cucian Anda
            </h2>
            <span className="small-print text-muted">
              Diperbarui {lastUpdated(order)}
            </span>
          </div>
          <CustomerOrderProgress order={order} className="mt-5" />
        </section>

        <div className="space-y-6">
          <section className="border border-rule bg-paper p-6">
            <h2>
              Ringkasan pesanan
            </h2>
            <dl className="mt-4 border-t border-ink">
              {[
                ["Pelanggan", maskName(order.customerName)],
                [
                  "Jadwal",
                  `${scheduleDateLabel(orderDate(order))} · ${order.schedule}`,
                ],
                ["Layanan", order.service],
                [
                  "Berat",
                  order.tier
                    ? `${order.weight}, ${tierLabel(order.tier)}`
                    : order.weight,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4 border-b border-rule py-2.5"
                >
                  <dt className="text-13 text-muted">{label}</dt>
                  <dd className="text-right text-sm font-medium text-ink">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 border-l-2 border-accent pl-3">
              <p className="flex items-center gap-2 text-sm font-medium text-ink">
                <MapPin className="h-4 w-4 shrink-0 text-accent" />
                {order.zoneId}, {zone?.name ?? "Zona"}
              </p>
              <p className="mt-0.5 text-13 text-muted">
                {zone?.area ?? "Area layanan Laundria"}
              </p>
            </div>

            <div className="mt-4 flex gap-2 border border-rule bg-paper-2 p-3">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              <p className="text-13 leading-relaxed text-muted">
                Alamat dan nomor telepon disembunyikan untuk menjaga privasi
                Anda.
              </p>
            </div>
          </section>

          <section className="border border-rule bg-paper-2 p-6">
            <h2>
              Semua pesanan, satu tempat.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Masuk ke akun untuk melihat riwayat dan detail lengkap pesanan
              Anda.
            </p>
            <Link
              href="/masuk"
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-control border border-ink bg-paper text-sm font-medium text-ink transition-colors duration-[var(--dur-micro)] hover:bg-paper-2"
            >
              Masuk ke akun
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4">
        <p className="text-13 text-muted">
          Waktu pengantaran dapat menyesuaikan kondisi operasional.
        </p>
        <Link
          href="/lokasi"
          className="inline-flex items-center gap-1.5 text-13 font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
        >
          <MessageSquareText className="h-4 w-4" />
          Butuh bantuan? Hubungi Laundria
        </Link>
      </div>
    </div>
  );
}

function NotFound({ code, onSearch }: { code: string; onSearch: (code: string) => void }) {
  const [value, setValue] = useState(code);
  return (
    <div className="mx-auto max-w-xl py-10">
      <div className="flex items-center gap-2.5">
        <span className="small-print text-accent">Pelacakan publik</span>
        <span aria-hidden="true" className="h-px w-8 bg-gold" />
      </div>
      <h1 className="mt-4 font-display text-4xl leading-tight">
        Kode pesanan tidak ditemukan.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Periksa kembali kode pada pesan WhatsApp Laundria. Format kode seperti{" "}
        <span className="font-outlier font-semibold text-ink">
          Z1-261104-012
        </span>
        .
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSearch(value);
        }}
        className="mt-6 flex gap-2"
      >
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label="Kode unik pesanan"
          className="font-outlier "
          placeholder="Z1-261104-012"
        />
        <Button type="submit" className="shrink-0">
          Periksa
        </Button>
      </form>
    </div>
  );
}

export function TrackingClient() {
  const orders = useAppStore((state) => state.orders);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCode = (searchParams.get("kode") ?? "").trim();
  const [submitted, setSubmitted] = useState(queryCode);

  const normalized = submitted.toUpperCase();
  const order = normalized
    ? orders.find(
        (item) => !item.deletedAt && item.code.toUpperCase() === normalized,
      )
    : undefined;

  function handleSearch(code: string) {
    const clean = code.trim().toUpperCase();
    setSubmitted(clean);
    router.replace(clean ? `/tracking?kode=${encodeURIComponent(clean)}` : "/tracking");
  }

  if (!queryCode && !submitted) {
    return <Landing onSearch={handleSearch} />;
  }

  if (!order) {
    return <NotFound code={submitted} onSearch={handleSearch} />;
  }

  return <Result key={order.code} order={order} onSearch={handleSearch} />;
}
