"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Circle,
  CircleDot,
  LogOut,
  MapPin,
  MessageCircle,
  PackageCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
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
import { driverActiveTasks, driverZoneHistory } from "@/lib/selectors";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { whatsappLinkTo } from "@/lib/constants";
import type { Order, OrderStatus, ZoneId } from "@/lib/types";

type Tab = "active" | "history";
type TaskFilter = "all" | "pickup" | "delivery";
type DriverAction = "pickup" | "delivery";

const NO_ZONES: ZoneId[] = [];

function pickupAction(order: Order): DriverAction {
  return order.status === "siap" ? "delivery" : "pickup";
}

function nextStatus(action: DriverAction): OrderStatus {
  return action === "pickup" ? "dicuci" : "selesai";
}

function SectionHeading({ title, count }: { title: string; count: number }) {
  return (
    <div className="mt-5 flex items-baseline justify-between first:mt-0">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <span className="text-13 text-muted">{count} pesanan</span>
    </div>
  );
}

function TaskCard({ order, onOpen }: { order: Order; onOpen: () => void }) {
  const pickup = order.status === "menunggu";

  return (
    <article className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[15px] font-semibold tracking-tight text-ink">
          {order.code}
        </p>
        <StatusBadge status={order.status} overdue={isOverdue(order)} />
      </div>

      <h3 className="mt-3 text-[17px] font-semibold leading-snug text-ink">
        {order.customerName}
      </h3>
      <p className="mt-1 text-sm text-muted">
        {pickup ? `${order.service}, ${order.phone}` : `${order.service} · ${order.weight}`}
      </p>

      <p className="mt-2.5 flex items-start gap-2 text-sm text-muted">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
        <span>{order.landmark}</span>
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-ink">
          {pickup ? "Jemput" : "Antar"} {scheduleWindow(order.schedule)}
        </span>
        {pickup ? (
          <a
            href={whatsappLinkTo(
              order.phone,
              `Halo ${order.customerName}, saya kurir Laundria untuk penjemputan ${order.code}.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-pill border border-border px-3 text-13 font-medium text-ink transition-colors hover:border-primary hover:text-primary"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Kurir
          </a>
        ) : null}
      </div>

      <Button className="mt-3.5 w-full" onClick={onOpen}>
        Perbarui Status
      </Button>
    </article>
  );
}

function HistoryCard({ order, onOpen }: { order: Order; onOpen: () => void }) {
  const zones = useAppStore((state) => state.zones);
  const zone = zones.find((item) => item.id === order.zoneId);
  const completion = [...order.history]
    .reverse()
    .find((event) => event.status === "selesai");

  return (
    <article className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[15px] font-semibold tracking-tight text-ink">
          {order.code}
        </p>
        <StatusBadge status="selesai" />
      </div>
      <h3 className="mt-2.5 text-[17px] font-semibold text-ink">
        {order.customerName}
      </h3>
      <p className="mt-1 text-sm text-muted">
        {order.service} · {order.weight}
      </p>
      <p className="mt-1 text-13 text-muted">
        Zona {order.zoneId}, {zone?.name ?? "Zona"}
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <span className="text-13 text-muted">
          Selesai{" "}
          {completion
            ? `${formatDateShort(completion.at)} ${formatTime(completion.at)} WIB`
            : "—"}
        </span>
        <span className="text-13 text-muted">{sessionLabel(order.session)}</span>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
      >
        Lihat Rincian Pesanan
      </button>
    </article>
  );
}

function ZoneMini({ order }: { order: Order }) {
  const zones = useAppStore((state) => state.zones);
  const zone = zones.find((item) => item.id === order.zoneId);
  return (
    <span className="text-13 text-muted">
      {order.zoneId}, {zone?.name ?? "Zona"}
    </span>
  );
}

function DetailRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="py-3.5 first:pt-0 last:pb-0">
      <dt className="text-13 text-muted">{label}</dt>
      <dd className="mt-1 text-base text-ink">{value}</dd>
      {hint ? <p className="mt-0.5 text-13 text-muted">{hint}</p> : null}
    </div>
  );
}

export function DriverClient() {
  const orders = useAppStore((state) => state.orders);
  const zones = useAppStore((state) => state.zones);
  const driverOnline = useAppStore((state) => state.driverOnline);
  const setDriverOnline = useAppStore((state) => state.setDriverOnline);
  const updateOrderStatus = useAppStore((state) => state.updateOrderStatus);
  const logout = useAppStore((state) => state.logout);
  const user = useCurrentUser();
  const { toast } = useToast();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("active");
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [statusOrderCode, setStatusOrderCode] = useState<string | null>(null);
  const [detailOrderCode, setDetailOrderCode] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [action, setAction] = useState<DriverAction>("pickup");

  const zoneIds = user?.zoneIds ?? NO_ZONES;
  const tasks = useMemo(
    () => (zoneIds.length > 0 ? driverActiveTasks(orders, zoneIds) : []),
    [orders, zoneIds],
  );
  const history = useMemo(
    () => (zoneIds.length > 0 ? driverZoneHistory(orders, zoneIds) : []),
    [orders, zoneIds],
  );

  const pickupTasks = tasks.filter((order) => order.status === "menunggu");
  const deliveryTasks = tasks.filter((order) => order.status === "siap");

  const statusOrder =
    orders.find((order) => order.code === statusOrderCode) ?? null;
  const detailOrder =
    orders.find((order) => order.code === detailOrderCode) ?? null;

  const zoneNames = zoneIds
    .map((id) => zones.find((zone) => zone.id === id)?.name)
    .filter(Boolean);
  const zoneSummary =
    zoneIds.length === 0
      ? "Belum ada zona tugas"
      : `Zona ${zoneIds.join("–")}, ${zoneNames.join("–")}`;
  const zoneNote =
    zoneIds.length === 0
      ? "Hubungi Owner untuk penugasan zona."
      : `Hanya menampilkan pesanan Zona ${zoneIds.join(" dan ")}.`;

  function openStatus(order: Order) {
    setAction(pickupAction(order));
    setStatusOrderCode(order.code);
  }

  function saveStatus() {
    if (!statusOrder) return;
    const result = updateOrderStatus(
      statusOrder.code,
      nextStatus(action),
      action === "pickup" ? "Penjemputan selesai" : "Pengantaran selesai",
    );
    if (!result.ok) {
      toast({ title: result.error, tone: "error" });
      return;
    }
    toast({
      title: driverOnline
        ? "Status pesanan diperbarui."
        : "Status diperbarui secara lokal. Data akan dikirim otomatis saat sinyal kembali.",
      tone: "success",
    });
    setStatusOrderCode(null);
  }

  if (!user) return null;

  const detailCompletion = detailOrder
    ? [...detailOrder.history].reverse().find((event) => event.status === "selesai")
    : undefined;

  const showPickup = filter !== "delivery";
  const showDelivery = filter !== "pickup";

  return (
    <div className="font-driver">
      {!driverOnline ? (
        <div className="bg-waiting-bg px-5 py-3 text-sm font-semibold leading-snug text-waiting-fg">
          Mode offline — koneksi terputus. Tugas yang diselesaikan akan disimpan
          sementara.
        </div>
      ) : null}

      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-5 py-3.5">
          <p className="text-[22px] font-extrabold tracking-tight text-primary">
            laundria
            <span className="ml-1.5 text-sm font-medium tracking-normal text-muted">
              / Driver
            </span>
          </p>
          <button
            type="button"
            onClick={() => {
              setDriverOnline(!driverOnline);
              toast({
                title: driverOnline
                  ? "Mode offline diaktifkan. Perubahan disimpan di perangkat."
                  : "Kembali online. Data siap dikirim.",
              });
            }}
            aria-pressed={driverOnline}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-13 font-medium transition-colors",
              driverOnline
                ? "bg-secondary text-primary hover:bg-secondary-hover"
                : "bg-track text-muted hover:text-ink",
            )}
          >
            {driverOnline ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            {driverOnline ? "Online" : "Offline"}
          </button>
        </div>
      </header>

      <section className="px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[26px] font-bold leading-tight tracking-tight text-ink">
              Halo, {user.name}
            </h1>
            <p className="mt-1 text-sm text-muted">{DEMO_DATE_LONG}</p>
          </div>
          <button
            type="button"
            onClick={() => setAccountOpen(true)}
            aria-label="Buka menu akun"
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-canvas text-sm font-semibold text-primary transition-colors hover:border-primary"
          >
            {initials(user.name)}
            <span
              className={cn(
                "absolute right-0 top-0 h-2.5 w-2.5 rounded-full ring-2 ring-surface",
                driverOnline ? "bg-done-fg" : "bg-danger-fg",
              )}
            />
          </button>
        </div>

        <p className="mt-3 text-sm text-muted">{zoneSummary}</p>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-pill bg-canvas px-3 py-2.5 text-center text-sm text-ink">
            Jemput: <span className="font-semibold">{pickupTasks.length} Pesanan</span>
          </div>
          <div className="rounded-pill bg-canvas px-3 py-2.5 text-center text-sm text-ink">
            Antar: <span className="font-semibold">{deliveryTasks.length} Pesanan</span>
          </div>
        </div>
      </section>

      <div className="mx-5 mt-4 grid grid-cols-2 rounded-xl bg-track p-1">
        <button
          type="button"
          onClick={() => setTab("active")}
          aria-pressed={tab === "active"}
          className={cn(
            "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            tab === "active"
              ? "bg-surface text-primary shadow-sm"
              : "text-muted hover:text-ink",
          )}
        >
          Daftar Tugas Aktif ({tasks.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          aria-pressed={tab === "history"}
          className={cn(
            "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            tab === "history"
              ? "bg-surface text-primary shadow-sm"
              : "text-muted hover:text-ink",
          )}
        >
          Riwayat Tugas Selesai
        </button>
      </div>

      {tab === "active" ? (
        <div className="px-5 pb-8 pt-4">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
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
                aria-pressed={filter === item.key}
                className={cn(
                  "inline-flex h-[38px] shrink-0 items-center rounded-pill border px-3.5 text-sm font-medium transition-colors",
                  filter === item.key
                    ? "border-primary bg-surface text-primary"
                    : "border-border bg-surface text-muted hover:border-primary hover:text-primary",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {showPickup && pickupTasks.length > 0 ? (
            <section>
              <SectionHeading title="Penjemputan" count={pickupTasks.length} />
              <div className="mt-3 space-y-3">
                {pickupTasks.map((order) => (
                  <TaskCard
                    key={order.code}
                    order={order}
                    onOpen={() => openStatus(order)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {showDelivery && deliveryTasks.length > 0 ? (
            <section>
              <SectionHeading title="Pengantaran" count={deliveryTasks.length} />
              <div className="mt-3 space-y-3">
                {deliveryTasks.map((order) => (
                  <TaskCard
                    key={order.code}
                    order={order}
                    onOpen={() => openStatus(order)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {tasks.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface px-5 py-10 text-center">
              <PackageCheck className="mx-auto h-7 w-7 text-primary" />
              <p className="mt-2 text-sm font-semibold text-ink">
                Tidak ada tugas aktif
              </p>
              <p className="mt-1 text-sm text-muted">
                Tugas baru akan muncul di sini sesuai zona Anda.
              </p>
            </div>
          ) : null}

          <p className="mt-6 text-center text-13 text-muted">{zoneNote}</p>
        </div>
      ) : (
        <div className="px-5 pb-8 pt-4">
          <div className="rounded-xl bg-secondary px-4 py-4">
            <p className="text-sm font-semibold text-primary">
              Riwayat Tugas Selesai
            </p>
            <p className="mt-1 text-base font-semibold text-ink">
              {history.length} pesanan selesai
            </p>
            <p className="mt-0.5 text-13 text-muted">{zoneSummary}</p>
          </div>

          {history.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface px-5 py-10 text-center">
              <PackageCheck className="mx-auto h-7 w-7 text-primary" />
              <p className="mt-2 text-sm font-semibold text-ink">
                Belum ada riwayat
              </p>
              <p className="mt-1 text-sm text-muted">
                Pesanan yang selesai di zona Anda akan tercatat di sini.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {history.map((order) => (
                <HistoryCard
                  key={order.code}
                  order={order}
                  onOpen={() => setDetailOrderCode(order.code)}
                />
              ))}
            </div>
          )}

          <p className="mt-6 text-center text-13 text-muted">{zoneNote}</p>
        </div>
      )}

      <Sheet
        open={Boolean(statusOrder)}
        onClose={() => setStatusOrderCode(null)}
        title="Perbarui status"
        side="bottom"
        size="lg"
        footer={
          <Button className="w-full" onClick={saveStatus} disabled={!statusOrder}>
            Simpan Perubahan
          </Button>
        }
      >
        {statusOrder ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-secondary p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-[15px] font-semibold text-ink">
                  {statusOrder.code}
                </span>
                <ZoneMini order={statusOrder} />
              </div>
              <p className="mt-2 text-base font-semibold text-ink">
                {statusOrder.customerName}
              </p>
              <div className="mt-2">
                <StatusBadge
                  status={statusOrder.status}
                  overdue={isOverdue(statusOrder)}
                />
              </div>
            </div>

            {(
              [
                {
                  key: "pickup" as DriverAction,
                  title: "Penjemputan Selesai",
                  body: "Cucian telah diambil dari pelanggan dan siap dibawa ke outlet.",
                  enabled: statusOrder.status === "menunggu",
                },
                {
                  key: "delivery" as DriverAction,
                  title: "Pengantaran Selesai",
                  body: "Cucian telah diserahkan dan diterima oleh pelanggan.",
                  enabled: statusOrder.status === "siap",
                },
              ]
            ).map((option) => {
              const selected = action === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  disabled={!option.enabled}
                  onClick={() => setAction(option.key)}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                    selected
                      ? "border-primary bg-secondary"
                      : "border-border bg-surface",
                    option.enabled
                      ? "hover:border-primary"
                      : "cursor-not-allowed opacity-50",
                  )}
                >
                  {selected ? (
                    <CircleDot className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
                  )}
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      {option.title}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-muted">
                      {option.body}
                    </span>
                    {!option.enabled ? (
                      <span className="mt-1 block text-13 text-muted">
                        {option.key === "pickup"
                          ? "Tersedia saat status Menunggu Penjemputan."
                          : "Tersedia saat status Siap Diantar."}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </Sheet>

      <Sheet
        open={Boolean(detailOrder)}
        onClose={() => setDetailOrderCode(null)}
        title={detailOrder ? `Rincian pesanan ${detailOrder.code}` : "Rincian pesanan"}
        side="bottom"
        size="lg"
        footer={
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setDetailOrderCode(null)}
          >
            Tutup
          </Button>
        }
      >
        {detailOrder ? (
          <div>
            <dl className="divide-y divide-border">
              <DetailRow label="Nama pelanggan" value={detailOrder.customerName} />
              <DetailRow label="Nomor WhatsApp" value={detailOrder.phone || "—"} />
              <DetailRow
                label="Alamat lengkap & patokan"
                value={detailOrder.landmark}
                hint={`Zona ${detailOrder.zoneId}, ${zones.find((zone) => zone.id === detailOrder.zoneId)?.name ?? "Zona"}`}
              />
              <DetailRow
                label="Jenis layanan & berat"
                value={detailOrder.service}
                hint={`${detailOrder.weight} · ${sessionLabel(detailOrder.session)}`}
              />
            </dl>

            <div className="mt-4 rounded-xl bg-secondary p-4">
              <p className="text-13 font-semibold text-primary">
                Riwayat penyelesaian
              </p>
              <p className="mt-1 text-base text-ink">
                {detailCompletion
                  ? `Selesai ${sessionLabel(detailOrder.session).toLowerCase()} oleh ${detailCompletion.by} pada ${formatTime(detailCompletion.at)} WIB`
                  : "Belum ada catatan penyelesaian."}
              </p>
              {detailCompletion ? (
                <p className="mt-0.5 text-13 text-muted">
                  {formatDateShort(detailCompletion.at)}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </Sheet>

      <Sheet
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        title="Akun saya"
        side="bottom"
        footer={
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setAccountOpen(false)}
          >
            Tutup
          </Button>
        }
      >
        <div>
          <dl className="divide-y divide-border">
            <DetailRow label="Nama" value={user.name} />
            <DetailRow label="Username" value={`@${user.username}`} />
            <DetailRow label="Peran" value="Driver" />
            <DetailRow label="Zona tugas" value={zoneSummary} />
          </dl>
          <Button
            variant="danger"
            className="mt-4 w-full"
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
