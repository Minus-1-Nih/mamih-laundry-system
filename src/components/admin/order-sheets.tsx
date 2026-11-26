"use client";

import { type ReactNode } from "react";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { StatusBadge, statusLabels } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { appBaseUrl, whatsappLinkTo } from "@/lib/constants";
import { DEMO_NOW } from "@/lib/demo-date";
import {
  addDaysToKey,
  formatDateKey,
  formatDateTime,
  orderDate,
  orderDeliveryDate,
  scheduleDateLabel,
} from "@/lib/format";
import { orderConfirmationMessage } from "@/lib/order-messages";
import {
  nextSessionDate,
  sessionFor,
  sessionWindowLabel,
} from "@/lib/sessions";
import {
  ORDER_STATUSES,
  nextStatusFor,
  statusDescriptions,
} from "@/lib/status-flow";
import { useAppStore, useCurrentUser } from "@/lib/store";
import type { Order, SessionType, User, Zone } from "@/lib/types";

function DetailRow({
  label,
  value,
  action,
}: {
  label: string;
  value: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-rule py-2.5 last:border-0">
      <dt className="shrink-0 text-13 text-muted">{label}</dt>
      <dd className="max-w-[62%] text-right text-sm font-medium text-ink">
        {value}
        {action ? <div className="mt-1.5">{action}</div> : null}
      </dd>
    </div>
  );
}

function BlockLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-6 flex items-center gap-2.5 border-t-2 border-ink pt-3">
      <span className="small-print text-ink">{children}</span>
    </h3>
  );
}

export interface OrderDetailSheetProps {
  order: Order | null;
  users: User[];
  zones: Zone[];
  open: boolean;
  onClose: () => void;
  onEditStatus: () => void;
  onDelete: () => void;
}

export function OrderDetailSheet({
  order,
  users,
  zones,
  open,
  onClose,
  onEditStatus,
  onDelete,
}: OrderDetailSheetProps) {
  const sessions = useAppStore((state) => state.sessions);
  const orders = useAppStore((state) => state.orders);
  const allocateOrder = useAppStore((state) => state.allocateOrder);
  const { toast } = useToast();

  if (!order) return null;
  const detailOrder = order;

  const zone = zones.find((item) => item.id === order.zoneId);
  const driver = users.find((user) => user.id === order.driverId);
  const pickupDate = orderDate(order);
  const deliveryDate = orderDeliveryDate(order);
  const others = orders.filter(
    (item) => item.code !== order.code && !item.deletedAt,
  );
  const wa = whatsappLinkTo(
    order.phone,
    orderConfirmationMessage(order, appBaseUrl(), sessions),
  );

  function nextDateFor(type: SessionType): string | null {
    const current = type === "pickup" ? pickupDate : deliveryDate;
    return nextSessionDate(
      type,
      sessions,
      others,
      addDaysToKey(current, 1),
      DEMO_NOW,
    );
  }

  function moveReason(type: SessionType): string | null {
    if (detailOrder.status === "selesai") return "Pesanan sudah selesai.";
    const session = sessionFor(type, sessions);
    if (!session) return "Sesi belum diatur.";
    if (!session.open) return "Sesi sedang tutup.";
    if (!nextDateFor(type)) return "Tidak ada tanggal kosong dalam 7 hari.";
    return null;
  }

  function handleMove(type: SessionType) {
    const target = nextDateFor(type);
    if (!target) return;
    const result = allocateOrder(
      detailOrder.code,
      type === "pickup" ? { pickupDate: target } : { deliveryDate: target },
    );
    if (!result.ok) {
      toast({ title: result.error, tone: "error" });
      return;
    }
    toast({
      title: `${
        type === "pickup" ? "Penjemputan" : "Pengantaran"
      } dipindah ke ${scheduleDateLabel(target)}.`,
    });
  }

  function moveButton(type: SessionType) {
    const reason = moveReason(type);
    return (
      <div>
        <button
          type="button"
          disabled={Boolean(reason)}
          onClick={() => handleMove(type)}
          className={cn(
            "inline-flex h-7 items-center border px-2.5 text-13 font-medium transition-colors duration-[var(--dur-micro)]",
            reason
              ? "border-rule text-muted"
              : "border-accent text-accent hover:bg-accent hover:text-accent-ink",
          )}
        >
          Pindahkan
        </button>
        {reason ? (
          <p className="mt-1 text-13 font-normal text-muted">{reason}</p>
        ) : (
          <p className="mt-1 text-13 font-normal text-muted">
            Otomatis ke tanggal kosong berikutnya.
          </p>
        )}
      </div>
    );
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Detail pesanan"
      size="lg"
      footer={
        <div className="flex items-center gap-2">
          <Button className="flex-1" onClick={onEditStatus}>
            Ubah status pesanan
          </Button>
          <Button
            variant="ghost"
            className="border border-danger-fg text-danger-fg hover:bg-danger-bg"
            onClick={onDelete}
          >
            Hapus
          </Button>
        </div>
      }
    >
      <p className="font-outlier text-lg font-semibold text-ink">
        {order.code}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2 border-b border-rule pb-4">
        <StatusBadge status={order.status} className="text-13" />
        <span className="small-print text-muted">
          Dibuat {formatDateTime(order.createdAt)} WIB
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-rule bg-paper-2 p-4">
        <div className="min-w-0">
          <p className="small-print text-muted">Pelanggan</p>
          <p className="mt-1 truncate text-sm font-semibold text-ink">
            {order.customerName}
          </p>
          <p className="text-13 text-muted">{order.phone}</p>
        </div>
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center border border-accent bg-paper px-3.5 text-13 font-medium text-accent transition-colors duration-[var(--dur-micro)] hover:bg-accent hover:text-accent-ink"
        >
          Kirim konfirmasi
        </a>
      </div>

      <BlockLabel>Rincian pesanan</BlockLabel>
      <dl className="mt-2">
        <DetailRow label="Layanan" value={order.service} />
        <DetailRow label="Berat" value={order.weight} />
        <DetailRow
          label="Zona"
          value={`${order.zoneId}, ${zone?.name ?? ""}`}
        />
        <DetailRow
          label="Penjemputan"
          value={
            <>
              <p>
                {scheduleDateLabel(pickupDate)}, {order.schedule} WIB
              </p>
              <p className="text-13 font-normal text-muted">
                {sessionWindowLabel("pickup", sessions)}
              </p>
            </>
          }
          action={moveButton("pickup")}
        />
        <DetailRow
          label="Pengantaran"
          value={
            <>
              <p>{scheduleDateLabel(deliveryDate)}</p>
              <p className="text-13 font-normal text-muted">
                {sessionWindowLabel("delivery", sessions)}
              </p>
            </>
          }
          action={moveButton("delivery")}
        />
        <DetailRow label="Patokan" value={order.landmark} />
        <DetailRow
          label="Driver"
          value={driver?.name ?? "Belum ditugaskan"}
        />
        {order.note ? <DetailRow label="Catatan" value={order.note} /> : null}
      </dl>

      <BlockLabel>Riwayat status</BlockLabel>
      <div className="mt-2">
        <OrderTimeline order={order} sessions={sessions} variant="admin" />
      </div>
      <p className="mt-4 border-l-2 border-gold bg-paper-2 px-3 py-2.5 text-13 leading-relaxed text-muted">
        Setiap perubahan status dicatat otomatis: waktu, status baru, dan
        pelakunya.
      </p>
    </Sheet>
  );
}

export interface OrderStatusSheetProps {
  order: Order | null;
  users: User[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function OrderStatusSheet(props: OrderStatusSheetProps) {
  const { order, users, open, onClose, onSaved } = props;
  if (!order) return null;

  return (
    <OrderStatusSheetForm
      key={order.code}
      order={order}
      users={users}
      open={open}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

interface OrderStatusSheetFormProps {
  order: Order;
  users: User[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function OrderStatusSheetForm({
  order,
  users,
  open,
  onClose,
  onSaved,
}: OrderStatusSheetFormProps) {
  const updateOrderStatus = useAppStore((state) => state.updateOrderStatus);
  const zones = useAppStore((state) => state.zones);
  const sessions = useAppStore((state) => state.sessions);
  const user = useCurrentUser();
  const { toast } = useToast();

  const driver = users.find((item) => item.id === order.driverId);
  const zone = zones.find((item) => item.id === order.zoneId);
  const next = user ? nextStatusFor(user.role, order.status) : null;
  const currentIndex = ORDER_STATUSES.indexOf(order.status);

  function handleAdvance() {
    if (!next) return;
    const result = updateOrderStatus(order.code, next);
    if (!result.ok) {
      toast({ title: result.error, tone: "error" });
      return;
    }
    toast({ title: `Status diperbarui: ${statusLabels[next]}.` });
    onSaved();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Perbarui status pesanan"
      description={`${order.code}, ${order.customerName}, ${order.zoneId} ${
        zone?.name ?? ""
      }`}
      size="lg"
      footer={
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1 border border-rule"
            onClick={onClose}
          >
            Tutup
          </Button>
          {next ? (
            <Button className="flex-1" onClick={handleAdvance}>
              {next === "dicuci"
                ? "Tandai Sedang Dicuci"
                : "Tandai Siap Diantar"}
            </Button>
          ) : null}
        </div>
      }
    >
      <ol className="border-t border-ink">
        {ORDER_STATUSES.map((status, index) => {
          const current = status === order.status;
          const reached = index < currentIndex;
          const upcoming = next === status;
          return (
            <li
              key={status}
              className={cn(
                "flex items-start gap-3 border-b border-rule px-3.5 py-3.5",
                current &&
                  "bg-accent-soft shadow-[inset_2px_0_0_var(--color-accent)]",
              )}
            >
              <span className="small-print w-6 shrink-0 pt-0.5 text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center border-2",
                  reached
                    ? "border-accent bg-accent"
                    : current
                      ? "border-accent bg-paper"
                      : "border-rule bg-paper",
                )}
                aria-hidden="true"
              >
                {reached ? <span className="h-1 w-1 bg-accent-ink" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      current ? "text-accent" : "text-ink",
                    )}
                  >
                    {statusLabels[status]}
                  </span>
                  {current ? (
                    <span className="text-13 font-medium text-accent">
                      Saat ini
                    </span>
                  ) : upcoming ? (
                    <span className="text-13 font-medium text-ink-2">
                      Berikutnya
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-13 text-muted">
                  {statusDescriptions[status]}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 border-l-2 border-gold bg-paper-2 px-3 py-2.5 text-13 leading-relaxed text-muted">
        {order.status === "selesai"
          ? "Pesanan sudah selesai dan terkunci. Riwayatnya tetap tersimpan."
          : order.status === "siap"
            ? "Siap diantar. Pengantaran dan penyelesaian dicatat oleh driver."
            : "Status hanya bisa maju satu tahap, dan setiap perubahan tercatat di riwayat. Pelanggan melihat tahap terbaru di halaman pelacakan."}
      </p>

      <BlockLabel>Ringkasan pesanan</BlockLabel>
      <dl className="mt-2">
        <DetailRow
          label="Pelanggan"
          value={`${order.customerName}, ${order.phone}`}
        />
        <DetailRow
          label="Penjemputan"
          value={`${formatDateKey(orderDate(order))}, ${order.schedule} WIB`}
        />
        <DetailRow
          label="Pengantaran"
          value={`${formatDateKey(
            orderDeliveryDate(order),
          )}, ${sessionWindowLabel("delivery", sessions)}`}
        />
        <DetailRow
          label="Driver"
          value={driver?.name ?? "Belum ditugaskan"}
        />
        <DetailRow label="Alamat" value={order.landmark} />
      </dl>
    </Sheet>
  );
}

export interface OrderDeleteSheetProps {
  order: Order | null;
  users: User[];
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export function OrderDeleteSheet({
  order,
  users,
  open,
  onClose,
  onDeleted,
}: OrderDeleteSheetProps) {
  const deleteOrder = useAppStore((state) => state.deleteOrder);
  const { toast } = useToast();

  if (!order) return null;

  const driver = users.find((user) => user.id === order.driverId);
  const running = order.status !== "selesai";

  function handleDelete() {
    if (!order) return;
    const result = deleteOrder(order.code);
    if (!result.ok) {
      toast({ title: result.error, tone: "error" });
      return;
    }
    toast({ title: "Pesanan dihapus." });
    onDeleted();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Hapus pesanan?"
      description={`${order.code}, ${order.customerName}`}
      size="lg"
      footer={
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1 border border-rule"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button variant="dangerSolid" className="flex-1" onClick={handleDelete}>
            Hapus pesanan
          </Button>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-ink">
        Pesanan akan dihapus permanen beserta riwayat statusnya. Tindakan ini
        tidak bisa dibatalkan.
      </p>

      {running ? (
        <div className="mt-4 border border-waiting-fg bg-waiting-bg px-3 py-2.5 text-13 leading-relaxed text-waiting-fg">
          Pesanan masih berjalan sebaiknya tidak dihapus. Perbarui lewat Ubah
          status, atau hubungi supervisor jika ini salah input.
        </div>
      ) : null}

      <BlockLabel>Dampak penghapusan</BlockLabel>
      <div className="mt-2 border border-rule bg-paper-2 p-4">
        <dl>
          <DetailRow
            label="Status saat ini"
            value={<StatusBadge status={order.status} />}
          />
          <DetailRow
            label="Driver"
            value={driver?.name ?? "Belum ditugaskan"}
          />
          <DetailRow
            label="Dibuat"
            value={`${formatDateTime(order.createdAt)} WIB`}
          />
          <DetailRow
            label="Riwayat status"
            value={
              <span className="text-danger-fg">
                {order.history.length} perubahan ikut terhapus
              </span>
            }
          />
        </dl>
      </div>
    </Sheet>
  );
}
