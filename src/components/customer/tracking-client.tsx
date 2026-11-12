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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatDateShort,
  formatDateTime,
  maskName,
} from "@/lib/format";
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
  return event ? `${formatDateTime(event.at)} WIB` : "—";
}

function HeroPanel() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-secondary p-8">
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-primary/15"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full border border-primary/10"
      />
      <div className="relative flex min-h-[420px] flex-col justify-between">
        <div className="mx-auto mt-6 flex flex-col items-center text-center">
          <span className="flex h-32 w-32 items-center justify-center rounded-[2rem] bg-surface text-primary shadow-sm">
            <WashingMachine className="h-14 w-14" strokeWidth={1.5} />
          </span>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface/80 px-3 py-1.5 text-13 font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Dirawat sepenuh hati
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface/80 px-3 py-1.5 text-13 font-medium text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Status transparan
            </span>
          </div>
        </div>

        <div className="relative mt-8 rounded-xl bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              <WashingMachine className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                Bersihnya sampai rumah.
              </p>
              <p className="mt-0.5 text-13 text-muted">
                Dirawat dengan hati, diantar dengan pasti.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-14">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 text-13 font-medium text-muted">
            <PackageSearch className="h-4 w-4 text-primary" />
            Pelacakan publik tanpa masuk akun
          </p>
          <h1 className="mt-4 text-[34px] font-bold leading-[1.15] tracking-tight text-ink sm:text-[40px]">
            Cucian Anda sampai
            <br />
            di tahap mana?
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
            Dari penjemputan hingga pengantaran. Masukkan Kode Unik Pesanan
            untuk memantau status cucian tanpa perlu masuk akun.
          </p>

          <Card className="mt-7 max-w-xl p-5">
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
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
                  className="font-mono uppercase tracking-wide"
                  autoComplete="off"
                />
              </div>
              <Button type="submit" className="shrink-0">
                Lacak pesanan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-3 text-13 text-muted">
              Periksa pesan WhatsApp dari Laundria untuk menemukan Kode Unik
              Pesanan Anda.
            </p>
          </Card>

          <p className="mt-4 inline-flex items-center gap-2 text-13 text-muted">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Aman dan praktis. Detail pribadi Anda tetap terlindungi.
          </p>
        </div>

        <HeroPanel />
      </div>

      <div className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-ink">
            Tiga langkah, tetap tenang.
          </h2>
          <Link
            href="/lokasi"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            Belum menerima kode? Hubungi Laundria
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="flex gap-3.5 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {step.body}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Result({ order, onSearch }: { order: Order; onSearch: (code: string) => void }) {
  const zones = useAppStore((state) => state.zones);
  const [code, setCode] = useState(order.code);
  const zone = zones.find((item) => item.id === order.zoneId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(code);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Kabar terbaru cucian Anda.
        </h1>
        <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2 sm:w-auto">
          <div className="relative min-w-0 flex-1">
            <PackageSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              aria-label="Kode unik pesanan"
              className="pl-9 font-mono uppercase tracking-wide"
            />
          </div>
          <Button type="submit" className="shrink-0">
            Periksa
          </Button>
        </form>
      </div>

      <Card className="mt-5 flex flex-wrap items-center justify-between gap-6 bg-secondary p-5">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface text-primary">
            <ReceiptText className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="font-mono text-sm font-semibold text-ink">
                {order.code}
              </p>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-2 text-lg font-semibold leading-snug text-ink">
              {statusSentence[order.status]}
            </p>
            <p className="mt-1 text-13 text-muted">
              Terakhir diperbarui {lastUpdated(order)}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-13 font-medium text-primary">
            Estimasi tiba di alamat
          </p>
          <p className="mt-0.5 text-lg font-semibold text-ink">
            {orderArrivalLabel(order)}
          </p>
          <p className="text-13 text-muted">
            Sesi pengantaran, 17.00–22.00 WIB
          </p>
        </div>
      </Card>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-ink">
              Perjalanan cucian Anda
            </h2>
            <span className="text-13 text-muted">
              Diperbarui {lastUpdated(order)}
            </span>
          </div>
          <CustomerOrderProgress order={order} className="mt-4" />
        </Card>

        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-ink">
              Ringkasan pesanan
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <dt className="text-13 text-muted">Pelanggan</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">
                  {maskName(order.customerName)}
                </dd>
              </div>
              <div>
                <dt className="text-13 text-muted">Tanggal pesanan</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">
                  {formatDateShort(order.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-13 text-muted">Layanan</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">
                  {order.service}
                </dd>
              </div>
              <div>
                <dt className="text-13 text-muted">Berat</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">
                  {order.weight}, Reguler
                </dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-border pt-4">
              <p className="flex items-center gap-2 text-sm font-medium text-ink">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                {order.zoneId}, {zone?.name ?? "Zona"}
              </p>
              <p className="mt-0.5 pl-6 text-13 text-muted">
                {zone?.area ?? "Area layanan Laundria"}
              </p>
            </div>

            <div className="mt-4 flex gap-2 rounded-lg bg-canvas p-3">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              <p className="text-13 leading-relaxed text-muted">
                Alamat dan nomor telepon disembunyikan untuk menjaga privasi
                Anda.
              </p>
            </div>
          </Card>

          <Card className="bg-secondary p-6">
            <h2 className="text-lg font-semibold text-ink">
              Semua pesanan, satu tempat.
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Masuk ke akun untuk melihat riwayat dan detail lengkap pesanan
              Anda.
            </p>
            <Link
              href="/masuk"
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-surface text-sm font-semibold text-primary transition-colors hover:bg-surface/80"
            >
              Masuk ke akun
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-13 text-muted">
          Waktu pengantaran dapat menyesuaikan kondisi operasional.
        </p>
        <Link
          href="/lokasi"
          className="inline-flex items-center gap-1.5 text-13 font-medium text-primary hover:text-primary-hover"
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
    <div className="mx-auto max-w-xl py-10 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-primary">
        <PackageSearch className="h-6 w-6" />
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">
        Kode pesanan tidak ditemukan.
      </h1>
      <p className="mt-2 text-sm text-muted">
        Periksa kembali kode pada pesan WhatsApp Laundria. Format kode seperti{" "}
        <span className="font-mono font-medium text-ink">Z1-261104-012</span>.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSearch(value);
        }}
        className="mt-5 flex gap-2"
      >
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label="Kode unik pesanan"
          className="font-mono uppercase tracking-wide"
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
