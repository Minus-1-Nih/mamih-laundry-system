"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderDocketList } from "@/components/admin/order-docket-list";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { cn } from "@/lib/cn";
import { DEMO_DATE_LONG } from "@/lib/demo-date";
import {
  isOverdue,
  isSessionActive,
  orderSequence,
  sessionLabel,
} from "@/lib/format";
import {
  countSession,
  countStatus,
  countZone,
  overdueOrders,
  readyWithoutDriver,
  todayOrders,
} from "@/lib/selectors";
import { useAppStore } from "@/lib/store";
import { SERVICE_HOURS } from "@/lib/constants";
import type { SessionType } from "@/lib/types";

function Metric({
  label,
  value,
  caption,
  alert = false,
}: {
  label: string;
  value: number;
  caption: string;
  alert?: boolean;
}) {
  return (
    <div className="px-4 py-4 first:pl-0 last:pr-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="small-print text-muted">{label}</p>
        <p className="font-display text-4xl leading-none">{value}</p>
      </div>
      <p className={cn("mt-3 text-13", alert ? "text-danger-fg" : "text-muted")}>
        {caption}
      </p>
    </div>
  );
}

function SessionBlock({
  type,
  start,
  end,
  count,
  drivers,
}: {
  type: SessionType;
  start: string;
  end: string;
  count: number;
  drivers: number;
}) {
  const active = isSessionActive(start, end);

  return (
    <div
      className={cn(
        "border-t-2 border-ink px-4 py-4",
        active &&
          "border-accent bg-accent-soft shadow-[inset_0_2px_0_var(--color-accent)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">{sessionLabel(type)}</p>
        <span
          className={cn(
            "small-print border px-2 py-0.5",
            active
              ? "border-accent bg-accent text-accent-ink"
              : "border-rule text-muted",
          )}
        >
          {active ? "Berlangsung" : "Terjadwal"}
        </span>
      </div>
      <p className="mt-4 font-display text-3xl leading-none">
        {count} <span className="text-base">pesanan</span>
      </p>
      <p className="small-print mt-4 border-t border-rule pt-2 text-muted">
        {start}-{end} WIB, {drivers} driver
      </p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const orders = useAppStore((state) => state.orders);
  const zones = useAppStore((state) => state.zones);
  const users = useAppStore((state) => state.users);
  const sessions = useAppStore((state) => state.sessions);

  const today = todayOrders(orders);
  const waiting = countStatus(today, "menunggu");
  const washing = countStatus(today, "dicuci");
  const ready = countStatus(today, "siap");
  const done = countStatus(today, "selesai");
  const late = overdueOrders(today);
  const withoutDriver = readyWithoutDriver(today);
  const recent = [...today]
    .sort((a, b) => orderSequence(a.code) - orderSequence(b.code))
    .slice(0, 5);
  const pages = Math.max(1, Math.ceil(today.length / 5));

  return (
    <>
      <AdminPageHeader
        title="Dashboard operasional"
        subtitle={`${DEMO_DATE_LONG}, sesi operasional ${SERVICE_HOURS}`}
        action={
          <Link
            href="/admin/pesanan/baru"
            className="inline-flex h-11 items-center gap-2 rounded-pill border border-accent bg-accent px-4 text-sm font-medium text-accent-ink transition-[background-color,border-color] duration-[var(--dur-micro)] hover:border-accent-hover hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Input pesanan
          </Link>
        }
      />

      <div className="grid border-y-2 border-ink sm:grid-cols-2 sm:divide-x sm:divide-rule xl:grid-cols-4 xl:divide-y-0">
        <Metric
          label="Total pesanan hari ini"
          value={today.length}
          caption={`${done} selesai, ${today.length - done} berjalan`}
        />
        <Metric
          label="Menunggu penjemputan"
          value={waiting}
          caption={
            late.length
              ? `${late.length} pesanan terlambat dijemput`
              : "Semua sesuai jadwal"
          }
          alert={late.length > 0}
        />
        <Metric
          label="Sedang dicuci"
          value={washing}
          caption="Rata-rata 3,2 jam"
        />
        <Metric
          label="Siap diantar"
          value={ready}
          caption={`${withoutDriver.length} belum ada driver`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="border border-rule bg-paper">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Sesi operasional hari ini
              </h2>
              <p className="mt-0.5 text-13 text-muted">
                Penjemputan 12.00-17.00, pengantaran 17.00-22.00 WIB.
              </p>
            </div>
            <Link
              href="/admin/pengaturan"
              className="text-13 font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
            >
              Kelola sesi
            </Link>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {sessions.map((session) => (
              <SessionBlock
                key={session.type}
                type={session.type}
                start={session.start}
                end={session.end}
                count={countSession(today, session.type)}
                drivers={session.type === "pickup" ? 3 : 2}
              />
            ))}
          </div>
        </section>

        <section className="border border-rule bg-paper p-5">
          <h2 className="text-sm font-semibold text-ink">
            Sebaran zona hari ini
          </h2>
          <dl className="mt-3 border-t border-ink">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="flex items-center justify-between gap-3 border-b border-rule py-3 last:border-b-0"
              >
                <dt className="flex items-baseline gap-2 text-sm text-ink">
                  <span className="small-print text-muted">{zone.id}</span>
                  {zone.name}
                </dt>
                <dd className="text-sm font-medium text-ink">
                  {countZone(today, zone.id)} pesanan
                </dd>
              </div>
            ))}
          </dl>
          <p className="small-print mt-4 border-t border-rule pt-3 text-muted">
            Diperbarui 2 menit lalu
          </p>
        </section>
      </div>

      <section className="mt-6 border border-rule bg-paper">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Pesanan terbaru</h2>
            <p className="mt-0.5 text-13 text-muted">
              {recent.length} dari {today.length} pesanan hari ini, diperbarui 2
              menit lalu
            </p>
          </div>
          <Link
            href="/admin/pesanan"
            className="text-13 font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
          >
            Lihat semua pesanan
          </Link>
        </div>

        {recent.length ? (
          <>
            <div className="hidden md:block">
              <Table>
              <THead>
                <TR>
                  <TH>Kode</TH>
                  <TH>Pelanggan</TH>
                  <TH className="hidden sm:table-cell">Zona</TH>
                  <TH className="hidden md:table-cell">Sesi</TH>
                  <TH>Status</TH>
                  <TH className="hidden sm:table-cell">Jadwal</TH>
                </TR>
              </THead>
              <TBody>
                {recent.map((order) => (
                  <TR key={order.code}>
                    <TD>
                      <Link
                        href={`/admin/pesanan?detail=${encodeURIComponent(order.code)}`}
                        className="font-outlier text-13 font-semibold tracking-[0.06em] whitespace-nowrap text-ink hover:text-accent"
                      >
                        {order.code}
                      </Link>
                    </TD>
                    <TD>
                      <Link
                        href={`/admin/pesanan?detail=${encodeURIComponent(order.code)}`}
                        className="text-sm font-medium text-ink hover:text-accent"
                      >
                        {order.customerName}
                      </Link>
                    </TD>
                    <TD className="hidden text-sm sm:table-cell">
                      {order.zoneId},{" "}
                      {zones.find((zone) => zone.id === order.zoneId)?.name}
                    </TD>
                    <TD className="hidden text-sm text-muted md:table-cell">
                      {sessionLabel(order.session)}
                    </TD>
                    <TD>
                      <StatusBadge
                        status={order.status}
                        overdue={isOverdue(order)}
                      />
                    </TD>
                    <TD className="hidden whitespace-nowrap text-sm sm:table-cell">
                      {order.schedule}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            </div>

            <OrderDocketList
              orders={recent}
              zones={zones}
              users={users}
              onOpen={(code) =>
                router.push(`/admin/pesanan?detail=${encodeURIComponent(code)}`)
              }
            />

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule px-5 py-3 text-13 text-muted">
              <span>
                Menampilkan {recent.length} dari {today.length} pesanan hari ini
              </span>
              <span>Halaman 1 dari {pages}</span>
            </div>
          </>
        ) : (
          <div className="p-5">
            <EmptyState
              title="Belum ada pesanan hari ini"
              description="Pesanan yang masuk lewat input WhatsApp akan tampil di sini."
            />
          </div>
        )}
      </section>
    </>
  );
}
