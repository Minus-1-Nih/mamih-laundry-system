"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  ChevronRight,
  CircleCheck,
  Clock,
  MapPin,
  MessageCircle,
  NotebookPen,
  Shirt,
  Truck,
  Wallet,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateLong, formatDateShort, formatRupiah, formatTime, initials } from "@/lib/format";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { whatsappLink } from "@/lib/constants";
import {
  CustomerOrderProgress,
  orderArrivalLabel,
} from "@/components/customer/order-progress";
import type { Order } from "@/lib/types";

const serviceCopy: Record<string, string> = {
  "Cuci Kering Setrika": "Dicuci, dikeringkan, disetrika, dan dikemas rapi",
  "Cuci Kering": "Dicuci, dikeringkan, dan dikemas rapi",
  Express: "Dicuci dan disetrika dengan prioritas selesai 24 jam",
  Setrika: "Disetrika dan dilipat rapi",
};

const PICKUP_FEE = 5_000;

function ratePerKg(order: Order): number {
  const kg = Number.parseFloat(order.weight.replace(",", "."));
  if (!Number.isFinite(kg) || kg <= 0) return 0;
  return Math.max(0, Math.round((order.total - PICKUP_FEE) / kg));
}

function lastEventLabel(order: Order): string {
  const event = order.history[order.history.length - 1];
  return event
    ? `${formatDateShort(event.at)}, ${formatTime(event.at)} WIB`
    : "Belum ada pembaruan";
}

export function OrderDetailClient() {
  const searchParams = useSearchParams();
  const code = (searchParams.get("kode") ?? "").trim();
  const orders = useAppStore((state) => state.orders);
  const zones = useAppStore((state) => state.zones);
  const user = useCurrentUser();

  const order = orders.find(
    (item) =>
      item.code.toUpperCase() === code.toUpperCase() &&
      item.customerId === user?.id &&
      !item.deletedAt,
  );
  const zone = order ? zones.find((item) => item.id === order.zoneId) : undefined;

  if (!order || !user) {
    return (
      <EmptyState
        title="Pesanan tidak ditemukan"
        description="Pesanan ini tidak terhubung dengan akun Anda atau sudah tidak tersedia."
        action={
          <Link
            href="/akun/riwayat"
            className="text-sm font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
          >
            Kembali ke riwayat pesanan
          </Link>
        }
      />
    );
  }

  const rate = ratePerKg(order);
  const weight = order.weight.replace(" kg", "");
  const rateLine = `${order.service}, ${weight} × ${formatRupiah(rate)}`;

  return (
    <div>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-13 text-muted">
        <Link href="/akun/riwayat" className="hover:text-ink">
          Riwayat Pesanan
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-ink">Detail Pesanan</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4 border-b border-rule pb-5">
        <div className="min-w-0">
          <p className="small-print text-accent">Detail pesanan</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl leading-tight sm:text-4xl">
              {order.code}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-sm text-muted">
            Dibuat {formatDateLong(order.createdAt)}, {formatTime(order.createdAt)} WIB
          </p>
        </div>
        <a
          href={whatsappLink(
            `Halo Laundria, saya ingin bertanya tentang pesanan ${order.code}.`,
          )}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-control border border-ink px-4 text-sm font-medium text-ink transition-colors duration-[var(--dur-micro)] hover:bg-paper-2"
        >
          Hubungi Laundria
          <MessageCircle className="h-4 w-4" />
        </a>
      </div>

      <section className="mt-5 flex flex-wrap items-center justify-between gap-4 border-2 border-ink bg-paper-2 p-5">
        <div className="flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-accent text-accent-ink">
            {order.status === "selesai" ? (
              <CircleCheck className="h-5 w-5" />
            ) : (
              <Truck className="h-5 w-5" />
            )}
          </span>
          <div>
            <p className="text-lg font-medium leading-snug text-ink">
              {order.status === "selesai"
                ? "Cucian sudah kembali ke rumah."
                : "Bersihnya segera kembali ke rumah."}
            </p>
            <p className="mt-1 text-sm text-muted">
              {order.status === "selesai"
                ? `Selesai diantar ${lastEventLabel(order)}`
                : `Estimasi tiba ${orderArrivalLabel(order)}, Sesi pengantaran, 17.00-22.00 WIB`}
            </p>
          </div>
        </div>
        <Link
          href="/sesi"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
        >
          Lihat sesi operasional
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <section className="border border-rule bg-paper p-6">
            <div className="flex items-start justify-between gap-3">
              <h2>
                Rincian layanan
              </h2>
              <span className="small-print shrink-0 border border-rule px-2 py-1 text-muted">
                Reguler, 2 hari
              </span>
            </div>

            <div className="mt-5 flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-paper-2 text-accent">
                <Shirt className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{order.service}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {serviceCopy[order.service] ?? "Dicuci dan dirawat sepenuh hati"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-ink">{order.weight}</p>
                <p className="small-print text-muted">{formatRupiah(rate)} / kg</p>
              </div>
            </div>

            {order.note ? (
              <div className="mt-5 flex gap-2.5 border-l-2 border-gold bg-paper-2 p-3.5">
                <NotebookPen className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div>
                  <p className="text-13 font-medium text-ink">
                    Catatan untuk tim Laundria
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{order.note}</p>
                </div>
              </div>
            ) : null}
          </section>

          <section className="border border-rule bg-paper p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2>
                Perjalanan pesanan
              </h2>
              <p className="small-print text-muted">
                Diperbarui {lastEventLabel(order)}
              </p>
            </div>
            <CustomerOrderProgress
              order={order}
              className="mt-5"
              showStage={false}
            />
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-rule bg-paper p-6">
            <h2>
              Pelanggan dan alamat
            </h2>

            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-accent-soft text-13 font-semibold text-accent">
                {initials(order.customerName)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">
                  {order.customerName}
                </p>
                <p className="text-13 text-muted">{order.phone}</p>
                <p className="text-13 text-muted">{user.email}</p>
              </div>
            </div>

            <div className="mt-5 border-t border-rule pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-ink">Rumah</span>
                <span className="small-print border border-rule px-2 py-0.5 text-muted">
                  {order.zoneId}, {zone?.name ?? "Zona"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                {order.landmark}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {zone?.area ?? "Area layanan Laundria"}
              </p>
              <Link
                href="/lokasi"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
              >
                Lihat lokasi dan detail alamat
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <p className="mt-4 flex items-center gap-2 border-t border-rule pt-4 text-13 text-muted">
              <CircleCheck className="h-4 w-4 text-accent" />
              Alamat penjemputan dan pengantaran sama.
            </p>
          </section>

          <section className="border border-rule bg-paper p-6">
            <h2>Ringkasan biaya</h2>

            <dl className="mt-4 border-t border-ink">
              <div className="flex items-start justify-between gap-3 border-b border-rule py-2.5 text-sm">
                <dt className="text-muted">{rateLine}</dt>
                <dd className="shrink-0 font-medium text-ink">
                  {formatRupiah(order.total - PICKUP_FEE)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 border-b border-rule py-2.5 text-sm">
                <dt className="text-muted">Antar jemput, {order.zoneId}</dt>
                <dd className="shrink-0 font-medium text-ink">
                  {formatRupiah(PICKUP_FEE)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-baseline justify-between gap-3 border-t-2 border-ink pt-4">
              <p className="text-sm font-semibold text-ink">Total pembayaran</p>
              <p className="font-display text-2xl text-accent">
                {formatRupiah(order.total)}
              </p>
            </div>

            <div className="mt-4 flex gap-2.5 border border-waiting-fg/30 bg-waiting-bg p-3.5">
              <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-waiting-fg" />
              <div>
                <p className="text-13 font-semibold text-waiting-fg">
                  Belum dibayar
                </p>
                <p className="mt-0.5 text-13 text-waiting-fg">
                  Tunai saat cucian diterima
                </p>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-2 border border-rule bg-paper-2 px-4 py-3 text-13 text-muted">
            <Clock className="h-4 w-4 shrink-0 text-accent" />
            Butuh perubahan? Hubungi Laundria sebelum penjemputan.
          </div>
        </div>
      </div>
    </div>
  );
}
