"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CloudOff,
  LogOut,
  MapPin,
  MessageCircle,
  PackageCheck,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { DEMO_DATE_LONG } from "@/lib/demo-date";
import {
  formatDateShort,
  formatTime,
  initials,
  isOverdue,
  scheduleWindow,
  sessionLabel,
} from "@/lib/format";
import { driverZoneHistory } from "@/lib/selectors";
import { legFor } from "@/lib/sessions";
import { useAppStore, useCurrentUser } from "@/lib/store";
import {
  DEMO_SESSION_MINUTES,
  demoNowAt,
  driverTasks,
  type DriverTaskList,
} from "@/lib/tasks";
import { whatsappLinkTo } from "@/lib/constants";
import type { Order, OrderStatus, ZoneId } from "@/lib/types";

type Tab = "active" | "history";
type TaskFilter = "all" | "pickup" | "delivery";
type DriverAction = "pickup" | "delivery";

const NO_ZONES: ZoneId[] = [];

const EMPTY_TASKS: DriverTaskList = {
  pickup: [],
  delivery: [],
  heldByOthers: 0,
};

function nextStatus(action: DriverAction): OrderStatus {
  return action === "pickup" ? "dicuci" : "selesai";
}

function SectionHeading({ title, count }: { title: string; count: number }) {
  return (
    <div className="mt-5 flex items-baseline justify-between gap-3 border-b border-rule pb-2">
      <h2 className="text-sm font-bold text-ink">{title}</h2>
      <span className="text-xs font-medium text-muted">{count} pesanan</span>
    </div>
  );
}

function TaskCard({
  order,
  isPendingSync,
  onConfirm,
}: {
  order: Order;
  isPendingSync?: boolean;
  onConfirm: (order: Order, action: DriverAction) => void;
}) {
  const pickup = order.status === "menunggu";
  const actionType: DriverAction = pickup ? "pickup" : "delivery";

  return (
    <article className="rounded-2xl border border-[#E2E8E4] bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header Kartu: Kode Pesanan, Status & Indikator Pending Sync */}
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#E2E8E4] pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold tracking-tight text-[#1F2937]">
            {order.code}
          </span>
          {isPendingSync ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
              <CloudOff className="h-3 w-3" />
              Menunggu Sinkronisasi
            </span>
          ) : null}
        </div>
        <StatusBadge status={order.status} overdue={isOverdue(order)} />
      </div>

      {/* Rincian Pelanggan & Layanan */}
      <div className="py-3">
        <h3 className="text-base font-semibold leading-snug text-ink">
          {order.customerName}
        </h3>
        <p className="mt-1 text-13 text-muted">
          {pickup
            ? `${order.service}, ${order.phone}`
            : `${order.service}, ${order.weight}`}
        </p>

        {/* Alamat Lengkap & Patokan */}
        <div className="mt-3 flex items-start gap-2 rounded-control bg-paper-2 p-2.5 text-13 text-ink-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span className="leading-snug">{order.landmark}</span>
        </div>
      </div>

      {/* Jadwal & Tombol WhatsApp */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-3 text-13">
        <span className="font-medium text-ink">
          {pickup ? "Jemput" : "Antar"}: {scheduleWindow(order.schedule)}
        </span>
        <a
          href={whatsappLinkTo(
            order.phone,
            pickup
              ? `Halo ${order.customerName}, saya kurir Laundria untuk penjemputan pesanan ${order.code}.`
              : `Halo ${order.customerName}, saya kurir Laundria untuk pengantaran pesanan ${order.code}.`,
          )}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-control border border-rule bg-paper-hi px-3 text-xs font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
        >
          <MessageCircle className="h-4 w-4 text-accent" />
          WhatsApp
        </a>
      </div>

      {/* Tombol Aksi Spesifik */}
      <div className="pt-3">
        {mine ? (
          <button
            type="button"
            onClick={() => onConfirm(order, actionType)}
            className="inline-flex h-12 w-full items-center justify-center rounded-control bg-accent text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.99]"
          >
            {pickup ? "Selesaikan Penjemputan" : "Selesaikan Pengantaran"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onClaim(order)}
            className="inline-flex h-12 w-full items-center justify-center rounded-control bg-accent text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.99]"
          >
            Ambil Tugas
          </button>
        )}
      </div>
    </article>
  );
}

function HistoryCard({
  order,
  isPendingSync,
  onOpen,
}: {
  order: Order;
  isPendingSync?: boolean;
  onOpen: () => void;
}) {
  const zones = useAppStore((state) => state.zones);
  const zone = zones.find((item) => item.id === order.zoneId);
  const isPickupFinished = order.status === "dicuci";
  const completion = [...order.history]
    .reverse()
    .find((event) =>
      isPickupFinished ? event.status === "dicuci" : event.status === "selesai",
    );

  return (
    <article className="rounded-2xl border border-[#E2E8E4] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#E2E8E4] pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold tracking-tight text-[#1F2937]">
            {order.code}
          </span>
          {isPendingSync ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
              <CloudOff className="h-3 w-3" />
              Menunggu Sinkronisasi
            </span>
          ) : null}
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="py-3">
        <h3 className="text-sm font-semibold text-ink">
          {order.customerName}
        </h3>
        <p className="mt-1 text-13 text-muted">
          {order.service}, {order.weight}
        </p>
        <p className="mt-1 text-13 text-muted">
          Zona {order.zoneId} ({zone?.name ?? "Zona"})
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-2.5 text-xs text-muted">
        <span>
          {isPickupFinished ? "Jemput Selesai: " : "Antar Selesai: "}
          {completion
            ? `${formatDateShort(completion.at)} ${formatTime(completion.at)} WIB`
            : "-"}
        </span>
        <span className="font-medium text-ink">
          {isPickupFinished ? "Penjemputan" : "Pengantaran"}
        </span>
      </div>

      <div className="border-t border-rule pt-3">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex text-xs font-semibold text-accent hover:underline"
        >
          Lihat rincian pesanan →
        </button>
      </div>
    </article>
  );
}

function DetailRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="border-b border-rule py-3 first:pt-0 last:border-b-0 last:pb-0">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
      {hint ? <p className="mt-0.5 text-13 text-muted">{hint}</p> : null}
    </div>
  );
}

export function DriverClient() {
  const orders = useAppStore((state) => state.orders);
  const zones = useAppStore((state) => state.zones);
  const sessions = useAppStore((state) => state.sessions);
  const driverOnline = useAppStore((state) => state.driverOnline);
  const setDriverOnline = useAppStore((state) => state.setDriverOnline);
  const offlineSyncQueue = useAppStore((state) => state.offlineSyncQueue);
  const queueOfflineAction = useAppStore((state) => state.queueOfflineAction);
  const syncOfflineQueue = useAppStore((state) => state.syncOfflineQueue);
  const updateOrderStatus = useAppStore((state) => state.updateOrderStatus);
  const logout = useAppStore((state) => state.logout);
  const demoMinutes = useAppStore((state) => state.demoMinutes);
  const setDemoMinutes = useAppStore((state) => state.setDemoMinutes);
  const claimOrder = useAppStore((state) => state.claimOrder);
  const markTasksSeen = useAppStore((state) => state.markTasksSeen);
  const user = useCurrentUser();
  const seenTaskCodes = useAppStore((state) =>
    user ? state.seenTaskCodes[user.id] : undefined,
  );
  const { toast } = useToast();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("active");
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [detailOrderCode, setDetailOrderCode] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);

  // State untuk modal konfirmasi 1-klik langsung
  const [confirmingOrder, setConfirmingOrder] = useState<Order | null>(null);
  const [confirmAction, setConfirmAction] = useState<DriverAction>("pickup");

  // Pendeteksi status jaringan real-time & Registrasi PWA Service Worker
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Cek status awal jaringan secara aman saat mount (menghindari hydration mismatch)
      setDriverOnline(navigator.onLine);

      // 2. Daftarkan Service Worker untuk kapabilitas PWA & Offline Caching
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // Abaikan kegagalan SW pada local environment tanpa HTTPS
        });
      }

      // 3. Listener saat koneksi online kembali (Auto-Sync)
      const handleOnline = () => {
        setDriverOnline(true);
        const { syncedCount } = syncOfflineQueue();
        if (syncedCount > 0) {
          toast({
            title: `Koneksi pulih. Berhasil menyinkronkan ${syncedCount} tugas offline ke server.`,
            tone: "success",
          });
        } else {
          toast({
            title: "Koneksi terhubung kembali. Sinkronisasi aktif.",
            tone: "success",
          });
        }
      };

      // 4. Listener saat koneksi offline
      const handleOffline = () => {
        setDriverOnline(false);
        toast({
          title: "Koneksi terputus. Mode offline diaktifkan (perubahan disimpan lokal).",
          tone: "error",
        });
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [setDriverOnline, syncOfflineQueue, toast]);

  const zoneIds = user?.zoneIds ?? NO_ZONES;
  const taskList = useMemo<DriverTaskList>(
    () =>
      user && zoneIds.length > 0
        ? driverTasks(orders, user, sessions, demoMinutes)
        : EMPTY_TASKS,
    [orders, user, sessions, demoMinutes, zoneIds],
  );
  const history = useMemo(
    () => (zoneIds.length > 0 ? driverZoneHistory(orders, zoneIds) : []),
    [orders, zoneIds],
  );

  const pickupTasks = taskList.pickup;
  const deliveryTasks = taskList.delivery;
  const tasks = [...pickupTasks, ...deliveryTasks];
  const now = demoNowAt(demoMinutes);
  const taskCodes = tasks.map((order) => order.code);
  const taskCodeKey = taskCodes.join("|");
  const unseen =
    seenTaskCodes === undefined
      ? 0
      : taskCodes.filter((code) => !seenTaskCodes.includes(code)).length;

  // First visit seeds the seen list, so only genuinely new tasks badge.
  useEffect(() => {
    if (user && seenTaskCodes === undefined) {
      markTasksSeen(taskCodeKey ? taskCodeKey.split("|") : []);
    }
  }, [user, seenTaskCodes, taskCodeKey, markTasksSeen]);

  const detailOrder =
    orders.find((order) => order.code === detailOrderCode) ?? null;

  const zoneNames = zoneIds
    .map((id) => zones.find((zone) => zone.id === id)?.name)
    .filter(Boolean);
  const zoneSummary =
    zoneIds.length === 0
      ? "Belum ada zona tugas"
      : `Zona ${zoneIds.join(", ")} (${zoneNames.join(", ")})`;
  const zoneNote =
    zoneIds.length === 0
      ? "Hubungi pemilik untuk penugasan zona."
      : `Menampilkan pesanan Zona ${zoneIds.join(" dan ")}.`;

  function isOrderPendingSync(code: string): boolean {
    return (offlineSyncQueue ?? []).some((item) => item.orderCode === code);
  }

  function openConfirm(order: Order, action: DriverAction) {
    setConfirmingOrder(order);
    setConfirmAction(action);
  }

  function handleClaim(order: Order) {
    const result = claimOrder(order.code);
    if (!result.ok) {
      toast({ title: result.error, tone: "error" });
      return;
    }
    toast({
      title: "Tugas diambil. Selesaikan saat sudah di lokasi.",
      tone: "success",
    });
    markTasksSeen(taskCodes);
  }

  function openActiveTab() {
    setTab("active");
    markTasksSeen(taskCodes);
  }

  function handleExecuteConfirm() {
    if (!confirmingOrder) return;
    const targetStatus = nextStatus(confirmAction);
    const actionNote =
      confirmAction === "pickup" ? "Penjemputan selesai" : "Pengantaran selesai";

    // Update optimis ke state lokal (tetap responsif instan)
    const result = updateOrderStatus(
      confirmingOrder.code,
      targetStatus,
      actionNote,
    );

    if (!result.ok) {
      toast({ title: result.error, tone: "error" });
      return;
    }

    // Jika sedang offline, masukkan ke antrean sinkronisasi
    if (!driverOnline) {
      queueOfflineAction({
        orderCode: confirmingOrder.code,
        status: targetStatus,
        note: actionNote,
      });

      toast({
        title: "Tersimpan di antrean offline (LocalStorage). Otomatis disinkronkan saat terhubung kembali.",
        tone: "info",
      });
    } else {
      toast({
        title: "Status pesanan berhasil diperbarui.",
        tone: "success",
      });
    }

    setConfirmingOrder(null);
  }

  if (!user) return null;

  const detailCompletion = detailOrder
    ? [...detailOrder.history]
        .reverse()
        .find((event) => event.status === "selesai" || event.status === "dicuci")
    : undefined;

  const showPickup = filter !== "delivery";
  const showDelivery = filter !== "pickup";

  return (
    <div className="font-driver bg-paper">
      {/* Banner Peringatan Mode Offline */}
      {!driverOnline ? (
        <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-13 font-medium text-amber-900">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span>
                Mode offline aktif.{" "}
                {(offlineSyncQueue ?? []).length > 0
                  ? `${(offlineSyncQueue ?? []).length} tugas tersimpan dalam antrean lokal.`
                  : "Perubahan disimpan di perangkat (LocalStorage)."}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Header Utama Navigasi */}
      <header className="sticky top-0 z-20 border-b border-rule bg-paper-hi">
        <div className="flex items-center justify-between gap-3 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Brand href="/driver" compact />
            <span className="rounded-control bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">
              Kurir
            </span>
          </div>

          {/* Toggle Online / Offline */}
          <button
            type="button"
            onClick={() => {
              const nextState = !driverOnline;
              setDriverOnline(nextState);
              if (nextState) {
                const { syncedCount } = syncOfflineQueue();
                if (syncedCount > 0) {
                  toast({
                    title: `Kembali online. ${syncedCount} tugas offline berhasil disinkronkan.`,
                    tone: "success",
                  });
                } else {
                  toast({
                    title: "Kembali online. Sinkronisasi aktif.",
                    tone: "success",
                  });
                }
              } else {
                toast({
                  title: "Mode offline diaktifkan secara manual.",
                  tone: "info",
                });
              }
            }}
            aria-pressed={driverOnline}
            className="inline-flex h-9 items-center gap-2 rounded-control border border-rule bg-paper-hi px-3.5 text-xs font-medium text-ink transition-colors hover:border-accent"
          >
            <span
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                driverOnline ? "bg-ready-bg" : "bg-danger-fg",
              )}
            />
            {driverOnline ? "Online" : "Offline"}
          </button>
        </div>
      </header>

      {/* Header Profil & Info Kurir */}
      <section className="px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* Badge Wilayah / Zona Aktif */}
            <span className="inline-flex items-center gap-1 rounded-control bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
              {zoneSummary}
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">
              Halo, {user.name}
            </h1>
            <p className="mt-1 text-xs text-muted">{DEMO_DATE_LONG}</p>
          </div>

          {/* Avatar Inisial dengan Indikator Titik Status Koneksi */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              aria-label="Buka profil kurir"
              className="flex h-12 w-12 items-center justify-center rounded-control border-2 border-rule bg-paper-hi text-base font-bold text-accent transition-colors hover:border-accent"
            >
              {initials(user.name)}
            </button>
            <span
              title={driverOnline ? "Status: Online" : "Status: Offline"}
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-paper-hi",
                driverOnline ? "bg-ready-bg" : "bg-danger-fg",
              )}
            />
          </div>
        </div>

        {/* Ringkasan Tugas Harian (Jemput & Antar) */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-card border border-rule bg-paper-hi p-3.5">
            <p className="text-xs font-medium text-muted">Tugas Penjemputan</p>
            <p className="mt-1 text-2xl font-bold text-ink">
              {pickupTasks.length}
              <span className="ml-1 text-xs font-normal text-muted">pesanan</span>
            </p>
          </div>
          <div className="rounded-card border border-rule bg-paper-hi p-3.5">
            <p className="text-xs font-medium text-muted">Tugas Pengantaran</p>
            <p className="mt-1 text-2xl font-bold text-ink">
              {deliveryTasks.length}
              <span className="ml-1 text-xs font-normal text-muted">pesanan</span>
            </p>
          </div>
        </div>

        {/* Sesi operasional yang sedang berjalan */}
        {taskList.activeSession || taskList.nextSession ? (
          <div className="mt-3 border border-rule bg-accent-soft px-3.5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-accent">
                {taskList.activeSession
                  ? `Sesi ${sessionLabel(taskList.activeSession.type).toLowerCase()} aktif`
                  : "Tidak ada sesi aktif"}
              </p>
              <span className="text-xs font-medium text-ink-2">
                {taskList.activeSession
                  ? `${taskList.activeSession.start}–${taskList.activeSession.end} WIB`
                  : taskList.nextSession
                    ? `${sessionLabel(taskList.nextSession.type)} ${taskList.nextSession.start} WIB`
                    : ""}
              </span>
            </div>
            <p className="mt-0.5 text-13 text-ink-2">
              {taskList.activeSession
                ? `Konfirmasi sampai ${taskList.activeSession.cutoff}.`
                : "Tugas sesi ini muncul saat sesi dimulai."}
            </p>
          </div>
        ) : null}
        {taskList.heldByOthers > 0 ? (
          <p className="mt-2 text-xs text-muted">
            {taskList.heldByOthers} tugas dipegang kurir lain.
          </p>
        ) : null}
      </section>

      {/* Navigasi Tab */}
      <div className="mx-5 mt-5 flex rounded-xl border border-[#E2E8E4] bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={openActiveTab}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1.5 rounded-control py-2.5 text-xs font-semibold transition-colors",
            tab === "active"
              ? "bg-accent text-accent-ink"
              : "text-muted hover:text-ink",
          )}
        >
          Daftar Tugas Aktif ({tasks.length})
          {unseen > 0 ? (
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center border px-1 text-[10px] font-bold",
                tab === "active"
                  ? "border-accent-ink bg-accent-ink text-accent"
                  : "border-accent bg-accent text-accent-ink",
              )}
            >
              {unseen}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={cn(
            "flex-1 rounded-control py-2.5 text-xs font-semibold transition-colors",
            tab === "history"
              ? "bg-accent text-accent-ink"
              : "text-muted hover:text-ink",
          )}
        >
          Riwayat Tugas Selesai
        </button>
      </div>

      {/* Konten Tab Aktif */}
      {tab === "active" ? (
        <div className="px-5 pb-8 pt-4">
          {/* Filter Chips Interaktif */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(
              [
                { key: "all", label: `Semua (${tasks.length})` },
                { key: "pickup", label: `Penjemputan (${pickupTasks.length})` },
                { key: "delivery", label: `Pengantaran (${deliveryTasks.length})` },
              ] as { key: TaskFilter; label: string }[]
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center rounded-control border px-3 text-xs font-medium transition-colors",
                  filter === item.key
                    ? "border-accent bg-accent text-accent-ink"
                    : "border-rule bg-paper-hi text-ink-2 hover:border-accent",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Bagian Penjemputan */}
          {showPickup && pickupTasks.length > 0 ? (
            <section>
              <SectionHeading title="Penjemputan" count={pickupTasks.length} />
              <div className="mt-3 space-y-3">
                {pickupTasks.map((order) => (
                  <TaskCard
                    key={order.code}
                    order={order}
                    isPendingSync={isOrderPendingSync(order.code)}
                    onConfirm={openConfirm}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {/* Bagian Pengantaran */}
          {showDelivery && deliveryTasks.length > 0 ? (
            <section>
              <SectionHeading title="Pengantaran" count={deliveryTasks.length} />
              <div className="mt-3 space-y-3">
                {deliveryTasks.map((order) => (
                  <TaskCard
                    key={order.code}
                    order={order}
                    isPendingSync={isOrderPendingSync(order.code)}
                    onConfirm={openConfirm}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {/* Tampilan Jika Tidak Ada Tugas */}
          {tasks.length === 0 ? (
            <div className="mt-4 rounded-card border border-dashed border-rule bg-paper-hi px-5 py-12 text-center">
              <PackageCheck className="mx-auto h-8 w-8 text-accent" />
              <p className="mt-3 text-sm font-semibold text-ink">
                Tidak ada tugas di sesi ini
              </p>
              <p className="mt-1 text-xs text-muted">
                {taskList.nextSession
                  ? `Sesi ${sessionLabel(taskList.nextSession.type).toLowerCase()} berikutnya ${taskList.nextSession.start} WIB.`
                  : "Tugas baru otomatis tampil saat sesi aktif."}
                {taskList.heldByOthers > 0
                  ? ` ${taskList.heldByOthers} tugas dipegang kurir lain.`
                  : ""}
              </p>
            </div>
          ) : null}

          <p className="mt-6 text-center text-xs text-muted">{zoneNote}</p>
        </div>
      ) : (
        /* Konten Tab Riwayat */
        <div className="px-5 pb-8 pt-4">
          <div className="rounded-card border border-rule bg-paper-hi p-4">
            <p className="text-xs font-medium text-muted">
              Total Tugas Selesai
            </p>
            <p className="mt-1 text-2xl font-bold text-ink">
              {history.length}
              <span className="ml-1.5 text-xs font-normal text-muted">
                pesanan
              </span>
            </p>
            <p className="mt-2 border-t border-rule pt-2 text-xs text-muted">
              {zoneSummary}
            </p>
          </div>

          {history.length === 0 ? (
            <div className="mt-4 rounded-card border border-dashed border-rule bg-paper-hi px-5 py-12 text-center">
              <PackageCheck className="mx-auto h-8 w-8 text-accent" />
              <p className="mt-3 text-sm font-semibold text-ink">
                Belum ada riwayat tugas
              </p>
              <p className="mt-1 text-xs text-muted">
                Pesanan yang selesai di zona Anda akan tersimpan di sini.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {history.map((order) => (
                <HistoryCard
                  key={order.code}
                  order={order}
                  isPendingSync={isOrderPendingSync(order.code)}
                  onOpen={() => setDetailOrderCode(order.code)}
                />
              ))}
            </div>
          )}

          <p className="mt-6 text-center text-xs text-muted">{zoneNote}</p>
        </div>
      )}

      {/* Modal Konfirmasi 1-Klik Langsung */}
      <Sheet
        open={Boolean(confirmingOrder)}
        onClose={() => setConfirmingOrder(null)}
        title={
          confirmAction === "pickup"
            ? "Konfirmasi Penjemputan"
            : "Konfirmasi Pengantaran"
        }
        side="bottom"
        size="md"
        footer={
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleExecuteConfirm}
              className="inline-flex h-12 w-full items-center justify-center rounded-control bg-accent text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.99]"
            >
              {confirmAction === "pickup"
                ? "Ya, Selesaikan Penjemputan"
                : "Ya, Selesaikan Pengantaran"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingOrder(null)}
              className="inline-flex h-11 w-full items-center justify-center rounded-control border border-rule bg-paper-hi text-sm font-medium text-ink-2 hover:bg-paper"
            >
              Batal
            </button>
          </div>
        }
      >
        {confirmingOrder ? (
          <div className="space-y-4 py-2">
            <div className="rounded-control border border-rule bg-paper-2 p-3.5">
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="font-outlier font-bold text-ink">
                  {confirmingOrder.code}
                </span>
                <span>Zona {confirmingOrder.zoneId}</span>
              </div>
              <p className="mt-2 text-base font-semibold text-ink">
                {confirmingOrder.customerName}
              </p>
              <p className="mt-1 text-xs text-ink-2">
                {confirmingOrder.landmark}
              </p>
            </div>

            <p className="text-13 leading-relaxed text-ink-2">
              {confirmAction === "pickup"
                ? "Apakah cucian kotor milik pelanggan telah berhasil diambil dan siap diproses di outlet?"
                : "Apakah cucian bersih telah selesai diantarkan dan diterima dengan baik oleh pelanggan?"}
            </p>
          </div>
        ) : null}
      </Sheet>

      {/* Modal Rincian Pesanan (Read-Only) */}
      <Sheet
        open={Boolean(detailOrder)}
        onClose={() => setDetailOrderCode(null)}
        title={
          detailOrder
            ? `Rincian Pesanan ${detailOrder.code}`
            : "Rincian Pesanan"
        }
        side="bottom"
        size="lg"
        footer={
          <Button
            variant="secondary"
            className="h-12 w-full rounded-control"
            onClick={() => setDetailOrderCode(null)}
          >
            Tutup
          </Button>
        }
      >
        {detailOrder ? (
          <div className="py-2">
            <dl className="divide-y divide-rule">
              <DetailRow
                label="Nama pelanggan"
                value={detailOrder.customerName}
              />
              <DetailRow
                label="Nomor WhatsApp"
                value={detailOrder.phone || "-"}
              />
              <DetailRow
                label="Alamat lengkap & patokan"
                value={detailOrder.landmark}
                hint={`Zona ${detailOrder.zoneId} (${zones.find((zone) => zone.id === detailOrder.zoneId)?.name ?? "Zona"})`}
              />
              <DetailRow
                label="Jenis layanan & berat"
                value={detailOrder.service}
                hint={`${detailOrder.weight}, ${sessionLabel(legFor(detailOrder)).toLowerCase()}`}
              />
            </dl>

            <div className="mt-4 rounded-control border border-rule bg-paper-2 p-3.5">
              <p className="text-xs font-semibold text-accent">
                Riwayat Penyelesaian
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                {detailCompletion
                  ? `${detailCompletion.note || (detailCompletion.status === "dicuci" ? "Penjemputan selesai" : "Pengantaran selesai")} oleh ${detailCompletion.by} pada ${formatTime(detailCompletion.at)} WIB`
                  : "Belum ada catatan penyelesaian."}
              </p>
              {detailCompletion ? (
                <p className="mt-0.5 text-xs text-muted">
                  {formatDateShort(detailCompletion.at)}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </Sheet>

      {/* Modal Profil Kurir */}
      <Sheet
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        title="Profil Kurir"
        side="bottom"
        footer={
          <Button
            variant="secondary"
            className="h-11 w-full rounded-control"
            onClick={() => setAccountOpen(false)}
          >
            Tutup
          </Button>
        }
      >
        <div className="py-2">
          <dl className="divide-y divide-rule">
            <DetailRow label="Nama" value={user.name} />
            <DetailRow label="Username" value={`@${user.username}`} />
            <DetailRow label="Peran" value="Kurir / Driver" />
            <DetailRow label="Zona tugas" value={zoneSummary} />
          </dl>

          {/* Pemilih sesi untuk meninjau alur penjemputan dan pengantaran */}
          <div className="mt-4 border border-rule bg-paper-2 p-3.5">
            <p className="text-xs font-semibold text-ink">Sesi demo</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Tugas hanya tampil pada sesi yang aktif. Pilih sesi untuk
              meninjau alur penjemputan atau pengantaran.
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {(
                [
                  { key: "pickup", label: "Penjemputan 14.00" },
                  { key: "delivery", label: "Pengantaran 18.00" },
                ] as const
              ).map((option) => {
                const active =
                  demoMinutes === DEMO_SESSION_MINUTES[option.key];
                return (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setDemoMinutes(DEMO_SESSION_MINUTES[option.key])
                    }
                    className={cn(
                      "inline-flex h-10 items-center justify-center rounded-control border px-2 text-xs font-semibold transition-colors",
                      active
                        ? "border-accent bg-accent text-accent-ink"
                        : "border-rule bg-paper-hi text-ink-2 hover:border-accent",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            variant="danger"
            className="mt-5 h-12 w-full rounded-control"
            onClick={() => {
              logout();
              router.push("/masuk/driver");
            }}
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
