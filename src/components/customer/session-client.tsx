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

function SessionBlock({ session }: { session: OperationalSession }) {
  const active = isSessionActive(session.start, session.end);
  const next = isSessionNext(session.start);
  const Icon = iconMap[session.type] ?? Clock;
  const status = active ? "Berlangsung" : next ? "Berikutnya" : "Tutup";
  const deadline = session.type === "pickup" ? "16.00 WIB" : "21.00 WIB";

  return (
    <article
      className={cn(
        "border-t-2 border-ink bg-paper px-5 pb-5 pt-4",
        active &&
          "border-accent bg-accent-soft shadow-[inset_0_2px_0_var(--color-accent)]",
        next && "bg-paper-2",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Icon className="h-5 w-5 text-accent" />
          <p className="text-base font-medium text-ink">
            Sesi {sessionLabel(session.type).toLowerCase()}
          </p>
        </div>
        <span
          className={cn(
            "small-print flex shrink-0 items-center gap-1.5",
            active ? "text-ink" : "text-muted",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              active ? "bg-done-fg" : "bg-muted/60",
            )}
          />
          {status}
        </span>
      </div>

      <p className="mt-6 font-display text-3xl leading-none">
        {session.start}-{session.end}{" "}
        <span className="small-print text-muted">WIB</span>
      </p>

      <div className="mt-6 border-t border-rule pt-3">
        <p className="flex items-center gap-2 text-13 text-muted">
          <Package className="h-4 w-4 text-accent" />
          {sessionLabel(session.type)}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2 text-sm">
          <span className="text-muted">Batas konfirmasi</span>
          <span className="font-medium text-ink">{deadline}</span>
        </div>
      </div>
    </article>
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
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-rule pb-5">
        <div className="min-w-0">
          <p className="small-print text-accent">Sesi operasional</p>
          <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
            Informasi sesi operasional
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Kenali waktu penjemputan dan pengantaran Laundria di area layanan
            Anda.
          </p>
        </div>
        <div className="sm:text-right">
          <span className="inline-flex h-9 items-center gap-2 border border-rule bg-paper px-3.5 text-13 font-medium text-ink">
            <span
              aria-hidden="true"
              className={cn(
                "h-2 w-2 rounded-full",
                open ? "bg-done-fg" : "bg-muted",
              )}
            />
            {open ? "Layanan buka" : "Layanan tutup"}
          </span>
          <p className="small-print mt-1.5 text-muted">Laundria Sukabirus, Z1</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-ink bg-paper-2 px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <Calendar className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-ink">{DEMO_DATE_LONG}</span>
          <span className="small-print border border-rule bg-paper px-2 py-0.5 text-accent">
            Hari ini
          </span>
          <span className="small-print text-muted">{DEMO_TIME}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent" />
          <Select
            defaultValue="Z1"
            aria-label="Pilih zona layanan"
            className="h-9 w-[150px]"
          >
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.id}, {zone.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {pickup ? <SessionBlock session={pickup} /> : null}
        {delivery ? <SessionBlock session={delivery} /> : null}

        <article className="border-t-2 border-ink bg-paper px-5 pb-5 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-muted" />
              <p className="text-base font-medium text-ink">
                Di luar jam operasional
              </p>
            </div>
            <span className="small-print flex shrink-0 items-center gap-1.5 text-muted">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-muted/60"
              />
              Tutup
            </span>
          </div>
          <p className="mt-6 font-display text-3xl leading-none">
            22.00-12.00 <span className="small-print text-muted">WIB</span>
          </p>
          <div className="mt-6 border-t border-rule pt-3">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted">Pesanan masuk</span>
              <span className="font-medium text-ink">Dijadwalkan 12.00 WIB</span>
            </div>
          </div>
        </article>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <section className="border border-rule bg-paper p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2>
                Jadwal pesanan Anda
              </h2>
              {user ? (
                <Link
                  href="/akun/riwayat"
                  className="text-sm font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
                >
                  Lihat semua pesanan
                </Link>
              ) : (
                <Link
                  href="/masuk"
                  className="text-sm font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
                >
                  Masuk untuk melihat jadwal
                </Link>
              )}
            </div>

            {activeOrders.length > 0 ? (
              <ul className="mt-4 border-t border-ink">
                {activeOrders.map((order) => {
                  const pickupOrder = order.status === "menunggu";
                  return (
                    <li
                      key={order.code}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-rule py-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-paper-2 text-accent">
                          {pickupOrder ? (
                            <Package className="h-4 w-4" />
                          ) : (
                            <Truck className="h-4 w-4" />
                          )}
                        </span>
                        <div>
                          <p className="font-outlier text-sm font-semibold text-ink">
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
                          {pickupOrder ? "12.00-17.00 WIB" : "17.00-22.00 WIB"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 border border-rule bg-paper-2 px-3 py-4 text-sm text-muted">
                Belum ada pesanan aktif.{" "}
                {user ? (
                  <Link
                    href="/akun/riwayat"
                    className="font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
                  >
                    Lihat riwayat pesanan
                  </Link>
                ) : (
                  <Link
                    href="/masuk"
                    className="font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
                  >
                    Masuk ke akun
                  </Link>
                )}
              </p>
            )}
          </section>

          <section className="flex items-start gap-3.5 border border-rule bg-paper-2 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-paper text-accent">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                Jam layanan Laundria
              </p>
              <p className="mt-0.5 text-sm text-muted">
                Setiap hari 12.00-22.00 WIB.
              </p>
              <p className="mt-0.5 text-13 text-muted">
                Pesanan di luar jam operasional masuk ke sesi berikutnya.
              </p>
            </div>
          </section>
        </div>

        <section className="border border-rule bg-paper p-5">
          <h2>
            Sebelum cucian dijemput
          </h2>
          <ul className="mt-4 border-t border-ink">
            {[
              {
                icon: Clock,
                title: "Konfirmasi sebelum batas sesi",
                body: "Pesanan setelah batas konfirmasi akan dijadwalkan pada sesi berikutnya.",
              },
              {
                icon: Sparkles,
                title: "Siapkan cucian dan akses rumah",
                body: "Kemas cucian dalam satu tas. Pastikan nomor WhatsApp dan alamat Anda aktif.",
              },
              {
                icon: MessageCircle,
                title: "Pantau kabar dari tim kami",
                body: "Waktu kedatangan mengikuti rute. Tim Laundria menghubungi Anda melalui WhatsApp.",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="flex gap-3 border-b border-rule py-3.5"
                >
                  <span className="small-print w-6 shrink-0 pt-0.5 text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm font-medium text-ink">{item.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <a
            href={whatsappLink("Halo Laundria, saya ingin menanyakan jadwal layanan.")}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-control border border-ink bg-paper text-sm font-medium text-ink transition-colors duration-[var(--dur-micro)] hover:bg-paper-2"
          >
            Tanya jadwal melalui WhatsApp
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </section>
      </div>

      <p className="mt-6 flex items-center gap-2 text-13 text-muted">
        {open ? (
          <CheckCircle2 className="h-4 w-4 text-accent" />
        ) : (
          <XCircle className="h-4 w-4 text-muted" />
        )}
        Waktu penjemputan dan pengantaran dapat menyesuaikan kondisi
        operasional.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-rule pt-3 text-13 text-muted">
        <span>
          Zona aktif: {zones.map((zone) => `${zone.id} ${zone.name}`).join(", ")}
        </span>
        <span className="border-l border-rule pl-5">
          Batas konfirmasi penjemputan 16.00 WIB
        </span>
        <span className="border-l border-rule pl-5">
          Batas konfirmasi pengantaran 21.00 WIB
        </span>
      </div>
    </div>
  );
}
