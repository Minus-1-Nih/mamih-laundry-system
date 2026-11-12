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
import { Card } from "@/components/ui/card";
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
    : "—";
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
            className="text-sm font-medium text-primary hover:text-primary-hover"
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

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[28px] font-bold tracking-tight text-ink">
              Detail pesanan
            </h1>
            <span className="font-mono text-sm font-semibold text-muted">
              {order.code}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted">
            Dibuat {formatDateLong(order.createdAt)}, {formatTime(order.createdAt)} WIB
          </p>
        </div>
        <a
          href={whatsappLink(
            `Halo Laundria, saya ingin bertanya tentang pesanan ${order.code}.`,
          )}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary"
        >
          Hubungi Laundria
          <MessageCircle className="h-4 w-4" />
        </a>
      </div>

      <Card className="mt-5 flex flex-wrap items-center justify-between gap-4 bg-secondary p-5">
        <div className="flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface text-primary">
            {order.status === "selesai" ? (
              <CircleCheck className="h-5 w-5" />
            ) : (
              <Truck className="h-5 w-5" />
            )}
          </span>
          <div>
            <p className="text-lg font-semibold text-ink">
              {order.status === "selesai"
                ? "Cucian sudah kembali ke rumah."
                : "Bersihnya segera kembali ke rumah."}
            </p>
            <p className="mt-0.5 text-sm text-muted">
              {order.status === "selesai"
                ? `Selesai diantar ${lastEventLabel(order)}`
                : `Estimasi tiba ${orderArrivalLabel(order)}, Sesi pengantaran, 17.00–22.00 WIB`}
            </p>
          </div>
        </div>
        <Link
          href="/sesi"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
        >
          Lihat sesi operasional
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Card>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-5">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-ink">Rincian layanan</h2>
              <span className="rounded-pill bg-secondary px-2.5 py-1 text-13 font-medium text-primary">
                Reguler, 2 hari
              </span>
            </div>

            <div className="mt-4 flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-canvas text-primary">
                <Shirt className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{order.service}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {serviceCopy[order.service] ?? "Dicuci dan dirawat sepenuh hati"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-ink">{order.weight}</p>
                <p className="text-13 text-muted">{formatRupiah(rate)} / kg</p>
              </div>
            </div>

            {order.note ? (
              <div className="mt-4 flex gap-2.5 rounded-lg bg-canvas p-3.5">
                <NotebookPen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-13 font-medium text-ink">
                    Catatan untuk tim Laundria
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{order.note}</p>
                </div>
              </div>
            ) : null}
          </Card>

          <Card className="p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-ink">
                Perjalanan pesanan
              </h2>
              <p className="text-13 text-muted">
                Diperbarui {lastEventLabel(order)}
              </p>
            </div>
            <CustomerOrderProgress
              order={order}
              className="mt-4"
              showStage={false}
            />
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-ink">
              Pelanggan dan alamat
            </h2>

            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-13 font-semibold text-primary">
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

            <div className="mt-4 border-t border-border pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-ink">Rumah</span>
                <span className="rounded-pill bg-secondary px-2 py-0.5 text-13 font-medium text-primary">
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
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
              >
                Lihat lokasi dan detail alamat
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <p className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-13 text-muted">
              <CircleCheck className="h-4 w-4 text-primary" />
              Alamat penjemputan dan pengantaran sama.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-ink">Ringkasan biaya</h2>

            <dl className="mt-4 space-y-3">
              <div className="flex items-start justify-between gap-3 text-sm">
                <dt className="text-muted">{rateLine}</dt>
                <dd className="shrink-0 font-medium text-ink">
                  {formatRupiah(order.total - PICKUP_FEE)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 text-sm">
                <dt className="text-muted">Antar jemput, {order.zoneId}</dt>
                <dd className="shrink-0 font-medium text-ink">
                  {formatRupiah(PICKUP_FEE)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-border pt-4">
              <p className="text-sm font-semibold text-ink">Total pembayaran</p>
              <p className="text-xl font-bold text-primary">
                {formatRupiah(order.total)}
              </p>
            </div>

            <div className="mt-4 flex gap-2.5 rounded-lg bg-waiting-bg p-3.5">
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
          </Card>

          <div className="flex items-center gap-2 rounded-xl bg-canvas px-4 py-3 text-13 text-muted">
            <Clock className="h-4 w-4 shrink-0 text-primary" />
            Butuh perubahan? Hubungi Laundria sebelum penjemputan.
          </div>
        </div>
      </div>
    </div>
  );
}
