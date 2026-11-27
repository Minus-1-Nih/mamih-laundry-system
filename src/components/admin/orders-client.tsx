"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderDocketList } from "@/components/admin/order-docket-list";
import {
  OrderDeleteSheet,
  OrderDetailSheet,
  OrderStatusSheet,
} from "@/components/admin/order-sheets";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge, statusLabels } from "@/components/ui/status-badge";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import {
  isOverdue,
  orderSequence,
  overdueHours,
  sessionLabel,
} from "@/lib/format";
import { legFor, serviceHours } from "@/lib/sessions";
import {
  countStatus,
  overdueOrders,
  todayOrders,
  visibleOrders,
  workingOrders,
} from "@/lib/selectors";
import { useAppStore } from "@/lib/store";
import type { Order, OrderStatus, SessionType, ZoneId } from "@/lib/types";

const PAGE_SIZE = 11;

type ZoneFilter = "all" | ZoneId;
type SessionFilter = "all" | SessionType;
type StatusFilter = "all" | OrderStatus;

export function OrdersClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const orders = useAppStore((state) => state.orders);
  const users = useAppStore((state) => state.users);
  const zones = useAppStore((state) => state.zones);
  const sessions = useAppStore((state) => state.sessions);

  const [search, setSearch] = useState("");
  const [zone, setZone] = useState<ZoneFilter>("all");
  const [session, setSession] = useState<SessionFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [attention, setAttention] = useState(false);
  const [page, setPage] = useState(1);

  const today = todayOrders(orders);
  const working = workingOrders(orders);
  const allVisible = visibleOrders(orders);
  const late = overdueOrders(working);

  const detailCode = searchParams.get("detail");
  const statusCode = searchParams.get("status");
  const deleteCode = searchParams.get("hapus");

  const detailOrder = allVisible.find((order) => order.code === detailCode) ?? null;
  const statusOrder = allVisible.find((order) => order.code === statusCode) ?? null;
  const deleteOrder = allVisible.find((order) => order.code === deleteCode) ?? null;

  const needle = search.trim().toLowerCase();
  const filtered = working
    .filter((order) => {
      if (attention && !isOverdue(order)) return false;
      if (zone !== "all" && order.zoneId !== zone) return false;
      if (session !== "all" && legFor(order) !== session) return false;
      if (status !== "all" && order.status !== status) return false;
      if (
        needle &&
        ![order.code, order.customerName, order.phone].some((value) =>
          value.toLowerCase().includes(needle),
        )
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => orderSequence(a.code) - orderSequence(b.code));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const filtering =
    search.trim() !== "" ||
    zone !== "all" ||
    session !== "all" ||
    status !== "all" ||
    attention;

  function setQuery(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function resetFilters() {
    setSearch("");
    setZone("all");
    setSession("all");
    setStatus("all");
    setAttention(false);
    setPage(1);
  }

  function driverName(order: Order): string {
    if (order.status === "menunggu" || order.status === "siap") {
      if (!order.assignedAt || !order.driverId) return "Belum diambil";
      return (
        users.find((user) => user.id === order.driverId)?.name ??
        "Belum diambil"
      );
    }
    const driverId =
      order.status === "dicuci"
        ? (order.pickupDriverId ?? order.driverId)
        : (order.deliveryDriverId ?? order.driverId);
    return (
      users.find((user) => user.id === driverId)?.name ?? "Belum ditugaskan"
    );
  }

  function zoneName(order: Order): string {
    return zones.find((item) => item.id === order.zoneId)?.name ?? "";
  }

  function handleExport() {
    const header = [
      "Kode",
      "Pelanggan",
      "No HP",
      "Zona",
      "Sesi",
      "Jadwal",
      "Layanan",
      "Berat",
      "Status",
      "Driver",
    ];
    const rows = filtered.map((order) => [
      order.code,
      order.customerName,
      order.phone,
      order.zoneId,
      sessionLabel(legFor(order)),
      order.schedule,
      order.service,
      order.weight,
      statusLabels[order.status],
      driverName(order),
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pesanan-laundria.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast({ title: "CSV pesanan diunduh." });
  }

  return (
    <>
      <AdminPageHeader
        title="Kelola pesanan"
        subtitle={`${today.length} pesanan hari ini, ${countStatus(
          working,
          "dicuci",
        )} sedang dicuci, ${countStatus(working, "siap")} siap diantar, sesi ${serviceHours(sessions)}`}
        action={
          <Link
            href="/admin/pesanan/baru"
            className="inline-flex h-11 items-center gap-2 rounded-control border border-accent bg-accent px-4 text-sm font-medium text-accent-ink transition-[background-color,border-color] duration-[var(--dur-micro)] hover:border-accent-hover hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Input pesanan
          </Link>
        }
      />

      <section className="border-y-2 border-ink">
        <div className="flex flex-wrap items-end gap-2.5 py-3.5">
          <div className="relative w-full sm:w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Cari kode, nama, atau HP"
              className="h-11 pl-9"
              aria-label="Cari pesanan"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setAttention((value) => !value);
              setPage(1);
            }}
            aria-pressed={attention}
            className={cn(
              "inline-flex h-11 items-center gap-2 border px-3.5 text-sm font-medium transition-colors duration-[var(--dur-micro)]",
              attention
                ? "border-danger-fg bg-danger-bg text-danger-fg"
                : "border-danger-fg bg-paper text-danger-fg hover:bg-danger-bg",
            )}
          >
            Perlu perhatian
            <span className="inline-flex min-w-5 items-center justify-center bg-danger-fg px-1 py-0.5 text-13 font-semibold tabular text-paper">
              {late.length}
            </span>
          </button>

          <div className="w-full sm:w-[160px]">
            <Select
              value={zone}
              onChange={(event) => {
                setZone(event.target.value as ZoneFilter);
                setPage(1);
              }}
              className="h-11"
              aria-label="Filter zona"
            >
              <option value="all">Semua zona</option>
              {zones.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id}, {item.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-[150px]">
            <Select
              value={session}
              onChange={(event) => {
                setSession(event.target.value as SessionFilter);
                setPage(1);
              }}
              className="h-11"
              aria-label="Filter sesi"
            >
              <option value="all">Semua sesi</option>
              <option value="pickup">Penjemputan</option>
              <option value="delivery">Pengantaran</option>
            </Select>
          </div>

          <div className="w-full sm:w-[160px]">
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatusFilter);
                setPage(1);
              }}
              className="h-11"
              aria-label="Filter status"
            >
              <option value="all">Semua status</option>
              <option value="menunggu">Menunggu</option>
              <option value="dicuci">Sedang dicuci</option>
              <option value="siap">Siap diantar</option>
              <option value="selesai">Selesai</option>
            </Select>
          </div>

          {filtering ? (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-11 items-center px-1 text-13 font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
            >
              Atur ulang
            </button>
          ) : null}
        </div>
      </section>

      <section className="mt-6 border border-rule bg-paper">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-4 py-3.5">
          <div className="flex items-baseline gap-2.5">
            <span className="small-print text-muted">Daftar</span>
            <h2>Pesanan operasional</h2>
            <span className="small-print border border-rule px-2 py-0.5 text-muted">
              {filtered.length} pesanan
            </span>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 text-13 font-medium text-accent underline decoration-gold underline-offset-4 transition-colors duration-[var(--dur-micro)] hover:text-accent-hover"
          >
            <Download className="h-4 w-4" />
            Ekspor CSV
          </button>
        </div>

        {filtered.length ? (
          <>
            <div className="hidden md:block">
              <Table>
              <THead>
                <TR>
                  <TH>Kode</TH>
                  <TH>Pelanggan</TH>
                  <TH>Zona</TH>
                  <TH>Jadwal</TH>
                  <TH>Layanan</TH>
                  <TH>Status</TH>
                  <TH>Driver</TH>
                  <TH className="text-right">Aksi</TH>
                </TR>
              </THead>
              <TBody>
                {pageOrders.map((order) => {
                  const overdue = isOverdue(order);
                  return (
                    <TR key={order.code}>
                      <TD>
                        <Link
                          href={`/admin/pesanan?detail=${encodeURIComponent(order.code)}`}
                          className="font-outlier text-13 font-semibold text-ink hover:text-accent"
                        >
                          {order.code}
                        </Link>
                      </TD>
                      <TD>
                        <p className="text-sm font-medium text-ink">
                          {order.customerName}
                        </p>
                        <p className="text-13 text-muted">{order.phone}</p>
                      </TD>
                      <TD className="text-sm text-ink">
                        {order.zoneId}, {zoneName(order)}
                      </TD>
                      <TD>
                        <p className="text-sm text-ink">{order.schedule}</p>
                        <p className="text-13 text-muted">
                          {sessionLabel(legFor(order))}
                        </p>
                      </TD>
                      <TD>
                        <p className="text-sm text-ink">{order.service}</p>
                        <p className="text-13 text-muted">{order.weight}</p>
                      </TD>
                      <TD>
                        <StatusBadge status={order.status} overdue={overdue} />
                        {overdue ? (
                          <p className="mt-1 text-13 text-danger-fg">
                            {overdueHours(order)} jam tertahan
                          </p>
                        ) : null}
                      </TD>
                      <TD className="text-sm text-ink">{driverName(order)}</TD>
                      <TD className="text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setQuery({
                              detail: order.code,
                              status: null,
                              hapus: null,
                            })
                          }
                          aria-label={`Buka detail ${order.code}`}
                          className="inline-flex h-9 w-9 items-center justify-center text-muted transition-colors duration-[var(--dur-micro)] hover:bg-paper-2 hover:text-ink"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
            </div>

            <OrderDocketList
              orders={pageOrders}
              zones={zones}
              users={users}
              onOpen={(code) =>
                setQuery({ detail: code, status: null, hapus: null })
              }
            />

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule px-4 py-3">
              <p className="small-print text-muted">
                Menampilkan {pageOrders.length} dari {filtered.length} pesanan
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Halaman sebelumnya"
                  className="inline-flex h-9 w-9 items-center justify-center border border-rule text-muted transition-colors duration-[var(--dur-micro)] hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setPage(pageNumber)}
                        aria-current={
                          pageNumber === currentPage ? "page" : undefined
                        }
                        className={cn(
                          "h-9 min-w-9 border px-2 text-13 font-medium tabular transition-colors duration-[var(--dur-micro)]",
                          pageNumber === currentPage
                            ? "border-accent bg-accent text-accent-ink"
                            : "border-rule text-muted hover:border-ink hover:text-ink",
                        )}
                      >
                        {pageNumber}
                      </button>
                    ),
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Halaman berikutnya"
                  className="inline-flex h-9 w-9 items-center justify-center border border-rule text-muted transition-colors duration-[var(--dur-micro)] hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-5">
            <EmptyState
              title="Pesanan tidak ditemukan"
              description="Coba ubah kata kunci atau filter yang dipakai."
              action={
                <Button variant="secondary" onClick={resetFilters}>
                  Reset filter
                </Button>
              }
            />
          </div>
        )}
      </section>

      <OrderDetailSheet
        order={detailOrder}
        users={users}
        zones={zones}
        open={Boolean(detailOrder)}
        onClose={() => setQuery({ detail: null })}
        onEditStatus={() =>
          setQuery({ detail: null, status: detailCode, hapus: null })
        }
        onDelete={() =>
          setQuery({ detail: null, status: null, hapus: detailCode })
        }
      />
      <OrderStatusSheet
        order={statusOrder}
        users={users}
        open={Boolean(statusOrder)}
        onClose={() => setQuery({ status: null })}
        onSaved={() =>
          setQuery({ detail: null, status: null, hapus: null })
        }
      />
      <OrderDeleteSheet
        order={deleteOrder}
        users={users}
        open={Boolean(deleteOrder)}
        onClose={() => setQuery({ hapus: null })}
        onDeleted={() =>
          setQuery({ detail: null, status: null, hapus: null })
        }
      />
    </>
  );
}
