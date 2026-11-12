"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card } from "@/components/ui/card";
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

function MetricCard({
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
    <Card className="p-4">
      <p className="text-13 text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-ink">{value}</p>
      <p className={cn("mt-1 text-13", alert ? "text-danger-fg" : "text-muted")}>
        {caption}
      </p>
    </Card>
  );
}

function SessionCard({
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
        "flex min-h-[142px] flex-col rounded-lg border p-4",
        active ? "border-primary/20 bg-secondary" : "border-border bg-surface",
      )}
    >
      <p
        className={cn(
          "text-sm font-medium",
          active ? "text-primary" : "text-ink",
        )}
      >
        {sessionLabel(type)}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-ink">
        {count} pesanan
      </p>
      <p className="mt-auto pt-5 text-13 text-muted">
        {start}–{end} WIB, {drivers} driver
      </p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const orders = useAppStore((state) => state.orders);
  const zones = useAppStore((state) => state.zones);
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
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Input pesanan
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total pesanan hari ini"
          value={today.length}
          caption={`${done} selesai, ${today.length - done} berjalan`}
        />
        <MetricCard
          label="Menunggu penjemputan"
          value={waiting}
          caption={
            late.length
              ? `${late.length} pesanan terlambat dijemput`
              : "Semua sesuai jadwal"
          }
          alert={late.length > 0}
        />
        <MetricCard
          label="Sedang dicuci"
          value={washing}
          caption="Rata-rata 3,2 jam"
        />
        <MetricCard
          label="Siap diantar"
          value={ready}
          caption={`${withoutDriver.length} belum ada driver`}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Sesi operasional hari ini
              </h2>
              <p className="mt-0.5 text-13 text-muted">
                Penjemputan 12.00–17.00, pengantaran 17.00–22.00 WIB.
              </p>
            </div>
            <Link
              href="/admin/pengaturan"
              className="text-13 font-medium text-primary hover:text-primary-hover"
            >
              Kelola sesi
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {sessions.map((session) => (
              <SessionCard
                key={session.type}
                type={session.type}
                start={session.start}
                end={session.end}
                count={countSession(today, session.type)}
                drivers={session.type === "pickup" ? 3 : 2}
              />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink">
            Sebaran zona hari ini
          </h2>
          <div className="mt-2">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="flex items-center justify-between border-b border-border py-2.5 last:border-0"
              >
                <span className="text-sm text-ink">
                  {zone.id}, {zone.name}
                </span>
                <span className="text-sm font-medium text-ink">
                  {countZone(today, zone.id)} pesanan
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="text-sm font-semibold text-ink">Pesanan terbaru</h2>
            <p className="mt-0.5 text-13 text-muted">
              {recent.length} dari {today.length} pesanan hari ini, diperbarui 2
              menit lalu
            </p>
          </div>
          <Link
            href="/admin/pesanan"
            className="text-13 font-medium text-primary hover:text-primary-hover"
          >
            Lihat semua pesanan
          </Link>
        </div>

        {recent.length ? (
          <>
            <Table>
              <THead className="bg-canvas">
                <TR>
                  <TH>Kode</TH>
                  <TH>Pelanggan</TH>
                  <TH>Zona</TH>
                  <TH>Sesi</TH>
                  <TH>Status</TH>
                  <TH>Jadwal</TH>
                </TR>
              </THead>
              <TBody>
                {recent.map((order) => (
                  <TR key={order.code}>
                    <TD>
                      <Link
                        href={`/admin/pesanan?detail=${encodeURIComponent(order.code)}`}
                        className="font-mono text-13 font-semibold text-ink hover:text-primary"
                      >
                        {order.code}
                      </Link>
                    </TD>
                    <TD>
                      <Link
                        href={`/admin/pesanan?detail=${encodeURIComponent(order.code)}`}
                        className="text-sm font-medium text-ink hover:text-primary"
                      >
                        {order.customerName}
                      </Link>
                    </TD>
                    <TD className="text-sm">
                      {order.zoneId},{" "}
                      {zones.find((zone) => zone.id === order.zoneId)?.name}
                    </TD>
                    <TD className="text-sm text-muted">
                      {sessionLabel(order.session)}
                    </TD>
                    <TD>
                      <StatusBadge
                        status={order.status}
                        overdue={isOverdue(order)}
                      />
                    </TD>
                    <TD className="text-sm">{order.schedule}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3 text-13 text-muted">
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
      </Card>
    </>
  );
}
