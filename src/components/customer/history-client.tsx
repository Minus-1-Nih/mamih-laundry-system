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
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { DEMO_NOW } from "@/lib/demo-date";
import { formatDateShort, formatRupiah, sessionLabel } from "@/lib/format";
import { customerOrders } from "@/lib/selectors";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { whatsappLink } from "@/lib/constants";
import type { Order } from "@/lib/types";

type Tab = "all" | "active" | "done";
type Range = "all" | "7" | "30";

const PAGE_SIZE = 8;

function Stat({
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
    <div className="flex items-start justify-between gap-4 py-5 lg:px-6 lg:first:pl-0 lg:last:pr-0">
      <div className="min-w-0">
        <p className="small-print text-muted">{label}</p>
        <p className="mt-1 font-display text-4xl leading-none">{value}</p>
        <p className="mt-2 text-13 leading-snug text-muted">{caption}</p>
      </div>
      <Icon className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
    </div>
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
    : "";

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
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-rule pb-5">
        <div className="min-w-0">
          <p className="small-print text-accent">Akun pelanggan</p>
          <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
            Riwayat Pesanan
          </h1>
          <p className="mt-2 text-sm text-muted">
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
          className="inline-flex h-11 items-center gap-2 rounded-control border border-accent bg-accent px-4 text-sm font-medium text-accent-ink transition-[background-color,border-color] duration-[var(--dur-micro)] hover:border-accent-hover hover:bg-accent-hover"
        >
          Pesan melalui WhatsApp
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-6 grid border-y-2 border-ink lg:grid-cols-3 lg:divide-x lg:divide-rule">
        <Stat
          icon={Package}
          label="Total Pesanan"
          value={String(all.length)}
          caption={since ? `Sejak ${since}` : "Belum ada pesanan"}
        />
        <Stat
          icon={RefreshCw}
          label="Sedang Berjalan"
          value={String(active.length)}
          caption="Pesanan Anda sedang diproses"
        />
        <Stat
          icon={CircleCheck}
          label="Selesai Diantar"
          value={String(done.length)}
          caption="Pakaian bersih telah sampai di rumah Anda"
        />
      </div>

      <div className="mt-8 border border-rule">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule bg-paper-2 px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((item) => (
              <Chip
                key={item.key}
                active={tab === item.key}
                onClick={() => setTabSafe(item.key)}
                aria-pressed={tab === item.key}
              >
                {item.label}
              </Chip>
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
                className="h-9 pl-9"
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
                className="h-9"
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
                      <p className="font-outlier text-sm font-semibold text-ink">
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
                        className="inline-flex items-center gap-1 text-sm font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
                      >
                        Detail
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-4 py-3">
              <p className="small-print text-muted">
                Menampilkan {start}-{end} dari {filtered.length} pesanan
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, safePage - 1))}
                  disabled={safePage === 1}
                  aria-label="Halaman sebelumnya"
                  className="inline-flex h-9 w-9 items-center justify-center border border-rule text-muted transition-colors duration-[var(--dur-micro)] hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="inline-flex h-9 min-w-9 items-center justify-center border border-accent bg-accent px-2 text-13 font-semibold tabular text-accent-ink">
                  {safePage}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(pageCount, safePage + 1))}
                  disabled={safePage === pageCount}
                  aria-label="Halaman berikutnya"
                  className="inline-flex h-9 w-9 items-center justify-center border border-rule text-muted transition-colors duration-[var(--dur-micro)] hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex gap-3 border-l-2 border-accent bg-paper-2 px-4 py-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
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
          <ShieldCheck className="h-4 w-4 text-accent" />
          Hanya pesanan yang terhubung dengan akun Anda yang ditampilkan.
        </p>
        <a
          href={whatsappLink("Halo Laundria, saya butuh bantuan terkait pesanan saya.")}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-accent underline decoration-gold underline-offset-4 hover:text-accent-hover"
        >
          Butuh bantuan? Hubungi Laundria
          <MessageCircle className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
