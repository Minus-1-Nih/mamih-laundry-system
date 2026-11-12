"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Package,
  Sparkles,
  Sun,
  Sunrise,
  Truck,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { DEMO_DATE_LONG, DEMO_TIME } from "@/lib/demo-date";
import { isSessionActive, isSessionNext, sessionLabel } from "@/lib/format";
import { customerOrders } from "@/lib/selectors";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { whatsappLink } from "@/lib/constants";
import { orderArrivalLabel } from "@/components/customer/order-progress";
import type { OperationalSession } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  pickup: Sunrise,
  delivery: Sun,
  closed: Clock,
};

function SessionCard({ session }: { session: OperationalSession }) {
  const active = isSessionActive(session.start, session.end);
  const next = isSessionNext(session.start);
  const Icon = iconMap[session.type] ?? Clock;
  const status = active ? "Berlangsung" : next ? "Berikutnya" : "Tutup";
  const deadline = session.type === "pickup" ? "16.00 WIB" : "21.00 WIB";

  return (
    <Card
      className={cn(
        "p-5",
        active && "border-primary",
        next && "border-primary bg-secondary",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Icon className="h-5 w-5 text-primary" />
          <p className="text-base font-semibold text-ink">
            Sesi {sessionLabel(session.type).toLowerCase()}
          </p>
        </div>
        <span
          className={cn(
            "rounded-pill px-2.5 py-1 text-13 font-medium",
            active ? "bg-secondary text-primary" : "bg-canvas text-muted",
          )}
        >
          {status}
        </span>
      </div>

      <p className="mt-4 text-xl font-bold tracking-tight text-ink">
        {session.start}–{session.end}{" "}
        <span className="text-sm font-medium text-muted">WIB</span>
      </p>

      <div className="mt-4 border-t border-border pt-3">
        <p className="flex items-center gap-2 text-13 text-muted">
          <Package className="h-4 w-4" />
          {sessionLabel(session.type)}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2 text-sm">
          <span className="text-muted">Batas konfirmasi</span>
          <span className="font-semibold text-ink">{deadline}</span>
        </div>
      </div>
    </Card>
  );
}

export function SessionClient() {
  const sessions = useAppStore((state) => state.sessions);
  const orders = useAppStore((state) => state.orders);
  const zones = useAppStore((state) => state.zones);
  const user = useCurrentUser();

  const myOrders = user ? customerOrders(orders, user.id) : [];
  const activeOrders = myOrders
    .filter((order) => order.status !== "selesai")
    .slice(0, 3);
  const pickup = sessions.find((session) => session.type === "pickup");
  const delivery = sessions.find((session) => session.type === "delivery");
  const open = sessions.some((session) =>
    isSessionActive(session.start, session.end),
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-ink">
            Informasi sesi operasional
          </h1>
          <p className="mt-1 text-sm text-muted">
            Kenali waktu penjemputan dan pengantaran Laundria di area layanan
            Anda.
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-secondary px-3 py-1.5 text-13 font-medium text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {open ? "Layanan buka" : "Layanan tutup"}
          </span>
          <p className="mt-1 text-13 text-muted">Laundria Sukabirus, Z1</p>
        </div>
      </div>

      <Card className="mt-5 flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-ink">{DEMO_DATE_LONG}</span>
          <span className="rounded-pill bg-secondary px-2 py-0.5 text-13 font-medium text-primary">
            Hari ini
          </span>
          <span className="text-13 text-muted">{DEMO_TIME}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <Select defaultValue="Z1" aria-label="Pilih zona layanan" className="h-9 w-[150px]">
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.id}, {zone.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {pickup ? <SessionCard session={pickup} /> : null}
        {delivery ? <SessionCard session={delivery} /> : null}

        <Card className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-muted" />
              <p className="text-base font-semibold text-ink">
                Di luar jam operasional
              </p>
            </div>
            <span className="rounded-pill bg-canvas px-2.5 py-1 text-13 font-medium text-muted">
              Tutup
            </span>
          </div>
          <p className="mt-4 text-xl font-bold tracking-tight text-ink">
            22.00–12.00 <span className="text-sm font-medium text-muted">WIB</span>
          </p>
          <div className="mt-4 border-t border-border pt-3">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted">Pesanan masuk</span>
              <span className="font-semibold text-ink">Dijadwalkan 12.00 WIB</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-ink">
                Jadwal pesanan Anda
              </h2>
              {user ? (
                <Link
                  href="/akun/riwayat"
                  className="text-sm font-medium text-primary hover:text-primary-hover"
                >
                  Lihat semua pesanan
                </Link>
              ) : (
                <Link
                  href="/masuk"
                  className="text-sm font-medium text-primary hover:text-primary-hover"
                >
                  Masuk untuk melihat jadwal
                </Link>
              )}
            </div>

            {activeOrders.length > 0 ? (
              <ul className="mt-3 divide-y divide-border">
                {activeOrders.map((order) => {
                  const pickupOrder = order.status === "menunggu";
                  return (
                    <li
                      key={order.code}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                          {pickupOrder ? (
                            <Package className="h-4 w-4" />
                          ) : (
                            <Truck className="h-4 w-4" />
                          )}
                        </span>
                        <div>
                          <p className="font-mono text-sm font-semibold text-ink">
                            {order.code}
                          </p>
                          <p className="text-13 text-muted">
                            {pickupOrder
                              ? `Penjemputan, Rumah`
                              : `Estimasi pengantaran, Rumah`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-13">
                        <p className="font-medium text-ink">
                          {pickupOrder
                            ? "Hari ini, Sesi penjemputan"
                            : orderArrivalLabel(order)}
                        </p>
                        <p className="text-muted">
                          {pickupOrder ? "12.00–17.00 WIB" : "17.00–22.00 WIB"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 rounded-lg bg-canvas px-3 py-4 text-sm text-muted">
                Belum ada pesanan aktif.{" "}
                {user ? (
                  <Link
                    href="/akun/riwayat"
                    className="font-medium text-primary hover:text-primary-hover"
                  >
                    Lihat riwayat pesanan
                  </Link>
                ) : (
                  <Link
                    href="/masuk"
                    className="font-medium text-primary hover:text-primary-hover"
                  >
                    Masuk ke akun
                  </Link>
                )}
              </p>
            )}
          </Card>

          <Card className="flex items-start gap-3.5 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                Jam layanan Laundria
              </p>
              <p className="mt-0.5 text-sm text-muted">
                Setiap hari 12.00–22.00 WIB.
              </p>
              <p className="mt-0.5 text-13 text-muted">
                Pesanan di luar jam operasional masuk ke sesi berikutnya.
              </p>
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-ink">
            Sebelum cucian dijemput
          </h2>
          <ul className="mt-3 space-y-4">
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-ink">
                  Konfirmasi sebelum batas sesi
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">
                  Pesanan setelah batas konfirmasi akan dijadwalkan pada sesi
                  berikutnya.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-ink">
                  Siapkan cucian dan akses rumah
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">
                  Kemas cucian dalam satu tas. Pastikan nomor WhatsApp dan
                  alamat Anda aktif.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-ink">
                  Pantau kabar dari tim kami
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">
                  Waktu kedatangan mengikuti rute. Tim Laundria menghubungi
                  Anda melalui WhatsApp.
                </p>
              </div>
            </li>
          </ul>

          <a
            href={whatsappLink("Halo Laundria, saya ingin menanyakan jadwal layanan.")}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface text-sm font-medium text-primary transition-colors hover:border-primary"
          >
            Tanya jadwal melalui WhatsApp
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </Card>
      </div>

      <p className="mt-4 flex items-center gap-2 text-13 text-muted">
        {open ? (
          <CheckCircle2 className="h-4 w-4 text-primary" />
        ) : (
          <XCircle className="h-4 w-4 text-muted" />
        )}
        Waktu penjemputan dan pengantaran dapat menyesuaikan kondisi
        operasional.
      </p>

      <div className="mt-2 flex flex-wrap gap-2 text-13 text-muted">
        <span>Zona aktif: {zones.map((zone) => `${zone.id} ${zone.name}`).join(", ")}</span>
        <span>·</span>
        <span>Batas konfirmasi penjemputan 16.00 WIB</span>
        <span>·</span>
        <span>Batas konfirmasi pengantaran 21.00 WIB</span>
      </div>
    </div>
  );
}
