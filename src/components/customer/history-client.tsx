"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Info,
  MessageCircle,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { cn } from "@/lib/cn";
import { DEMO_NOW } from "@/lib/demo-date";
import { formatDateShort, formatRupiah, sessionLabel } from "@/lib/format";
import { customerOrders } from "@/lib/selectors";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { whatsappLink } from "@/lib/constants";
import type { Order } from "@/lib/types";

type Tab = "all" | "active" | "done";
type Range = "all" | "7" | "30";

const PAGE_SIZE = 8;

function StatCard({
  icon: Icon,
  label,
  value,
  caption,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-ink">
          <span className="text-xl font-bold">{value}</span>{" "}
          <span className="font-medium">{label}</span>
        </p>
        <p className="mt-0.5 text-13 text-muted">{caption}</p>
      </div>
    </Card>
  );
}

function orderTotal(order: Order): number {
  return order.total;
}

export function HistoryClient() {
  const orders = useAppStore((state) => state.orders);
  const user = useCurrentUser();
  const [tab, setTab] = useState<Tab>("all");
  const [range, setRange] = useState<Range>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const all = useMemo(
    () => (user ? customerOrders(orders, user.id) : []),
    [orders, user],
  );

  const active = all.filter((order) => order.status !== "selesai");
  const done = all.filter((order) => order.status === "selesai");

  const filtered = all
    .filter((order) => {
      if (tab === "active" && order.status === "selesai") return false;
      if (tab === "done" && order.status !== "selesai") return false;
      if (range !== "all") {
        const days = Number(range) * 86_400_000;
        if (DEMO_NOW.getTime() - new Date(order.createdAt).getTime() > days) {
          return false;
        }
      }
      if (search.trim()) {
        return order.code.toLowerCase().includes(search.trim().toLowerCase());
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const start = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const end = Math.min(safePage * PAGE_SIZE, filtered.length);

  const since = all.length
    ? formatDateShort(
        all.reduce((earliest, order) =>
          new Date(order.createdAt) < new Date(earliest.createdAt)
            ? order
            : earliest,
        ).createdAt,
      )
        .split(" ")
        .slice(1)
        .join(" ")
    : "—";

  function setTabSafe(next: Tab) {
    setTab(next);
    setPage(1);
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: `Semua (${all.length})` },
    { key: "active", label: `Berjalan (${active.length})` },
    { key: "done", label: `Selesai (${done.length})` },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-ink">
            Riwayat Pesanan
          </h1>
          <p className="mt-1 text-sm text-muted">
            Halo, {user?.name.split(" ")[0] ?? "Pelanggan"}. Semua riwayat
            pesanan laundry Anda tersedia di sini.
          </p>
        </div>
        <a
          href={whatsappLink(
            "Halo Laundria, saya ingin memesan layanan laundry.",
          )}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Pesan melalui WhatsApp
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <StatCard
          icon={Package}
          label="Total Pesanan"
          value={String(all.length)}
          caption={`Sejak ${since}`}
        />
        <StatCard
          icon={RefreshCw}
          label="Sedang Berjalan"
          value={String(active.length)}
          caption="Pesanan Anda sedang diproses"
        />
        <StatCard
          icon={CircleCheck}
          label="Selesai Diantar"
          value={String(done.length)}
          caption="Pakaian bersih telah sampai di rumah Anda"
        />
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTabSafe(item.key)}
                aria-pressed={tab === item.key}
                className={cn(
                  "inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors",
                  tab === item.key
                    ? "bg-secondary text-primary"
                    : "text-muted hover:bg-canvas hover:text-ink",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-[230px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Cari kode pesanan"
                className="h-10 pl-9"
                aria-label="Cari kode pesanan"
              />
            </div>
            <div className="w-full sm:w-[170px]">
              <Select
                value={range}
                onChange={(event) => {
                  setRange(event.target.value as Range);
                  setPage(1);
                }}
                className="h-10"
                aria-label="Filter tanggal"
              >
                <option value="all">Semua Tanggal</option>
                <option value="7">7 hari terakhir</option>
                <option value="30">30 hari terakhir</option>
              </Select>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Belum ada pesanan yang cocok"
              description="Ubah tab, kata kunci, atau rentang tanggal untuk melihat pesanan lain."
            />
          </div>
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>Kode pesanan</TH>
                  <TH>Tanggal</TH>
                  <TH>Layanan</TH>
                  <TH>Status</TH>
                  <TH>Total</TH>
                  <TH className="text-right">Aksi</TH>
                </tr>
              </THead>
              <TBody>
                {visible.map((order) => (
                  <TR key={order.code}>
                    <TD>
                      <p className="font-mono text-sm font-semibold text-ink">
                        {order.code}
                      </p>
                      <p className="mt-0.5 text-13 text-muted">
                        {sessionLabel(order.session)}, {order.zoneId}
                      </p>
                    </TD>
                    <TD className="whitespace-nowrap text-sm font-medium text-ink">
                      {formatDateShort(order.createdAt)}
                    </TD>
                    <TD>
                      <p className="text-sm text-ink">{order.service}</p>
                      <p className="mt-0.5 text-13 text-muted">
                        {order.weight}, Reguler
                      </p>
                    </TD>
                    <TD>
                      <StatusBadge status={order.status} />
                    </TD>
                    <TD className="whitespace-nowrap text-sm font-medium text-ink">
                      {formatRupiah(orderTotal(order))}
                    </TD>
                    <TD className="text-right">
                      <Link
                        href={`/akun/riwayat/detail?kode=${order.code}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
                      >
                        Detail
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
              <p className="text-13 text-muted">
                Menampilkan {start}–{end} dari {filtered.length} pesanan
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, safePage - 1))}
                  disabled={safePage === 1}
                  aria-label="Halaman sebelumnya"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-secondary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-secondary px-2 text-13 font-semibold text-primary">
                  {safePage}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(pageCount, safePage + 1))}
                  disabled={safePage === pageCount}
                  aria-label="Halaman berikutnya"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-secondary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      <div className="mt-5 flex gap-3 rounded-xl border-l-4 border-primary bg-secondary px-4 py-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold text-ink">
            Lacak pesanan tanpa masuk akun
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted">
            Pantau status tanpa masuk akun menggunakan kode unik. Kode dan
            tautan pelacakan dikirim otomatis melalui template WhatsApp setelah
            Admin menekan “Simpan dan Kirim Kode”.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-13 text-muted">
        <p className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4" />
          Hanya pesanan yang terhubung dengan akun Anda yang ditampilkan.
        </p>
        <a
          href={whatsappLink("Halo Laundria, saya butuh bantuan terkait pesanan saya.")}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-primary-hover"
        >
          Butuh bantuan? Hubungi Laundria
          <MessageCircle className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
