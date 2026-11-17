"use client";

import { useState, type ReactNode } from "react";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { StatusBadge, statusLabels } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { appBaseUrl, whatsappLinkTo } from "@/lib/constants";
import {
  formatDateKey,
  formatDateTime,
  orderDate,
  scheduleDateLabel,
  sessionLabel,
  todayKey,
} from "@/lib/format";
import { orderConfirmationMessage } from "@/lib/order-messages";
import { useAppStore } from "@/lib/store";
import type { Order, OrderStatus, User, Zone } from "@/lib/types";

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-rule py-2.5 last:border-0">
      <dt className="shrink-0 text-13 text-muted">{label}</dt>
      <dd className="max-w-[62%] text-right text-sm font-medium text-ink">
        {value}
      </dd>
    </div>
  );
}

function BlockLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-6 flex items-center gap-2.5 border-t-2 border-ink pt-3">
      <span className="small-print text-accent">{children}</span>
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
  if (!order) return null;

  const zone = zones.find((item) => item.id === order.zoneId);
  const driver = users.find((user) => user.id === order.driverId);
  const scheduledDay = orderDate(order);
  const scheduleValue =
    scheduledDay === todayKey()
      ? `${order.schedule} WIB`
      : `${scheduleDateLabel(scheduledDay)} · ${order.schedule} WIB`;
  const wa = whatsappLinkTo(
    order.phone,
    orderConfirmationMessage(order, appBaseUrl()),
  );

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
      <p className="font-outlier text-lg font-semibold tracking-[0.08em] text-ink">
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
        <DetailRow label="Sesi" value={sessionLabel(order.session)} />
        <DetailRow label="Jadwal" value={scheduleValue} />
        <DetailRow label="Patokan" value={order.landmark} />
        <DetailRow
          label="Driver"
          value={driver?.name ?? "Belum ditugaskan"}
        />
        {order.note ? <DetailRow label="Catatan" value={order.note} /> : null}
      </dl>

      <BlockLabel>Riwayat status</BlockLabel>
      <div className="mt-2">
        <OrderTimeline order={order} variant="admin" />
      </div>
      <p className="mt-4 border-l-2 border-gold bg-paper-2 px-3 py-2.5 text-13 leading-relaxed text-muted">
        Setiap perubahan status dicatat otomatis: waktu, status baru, dan
        pelakunya.
      </p>
    </Sheet>
  );
}

const statusOptions: {
  status: OrderStatus;
  description: string;
}[] = [
  { status: "menunggu", description: "Belum dijemput driver." },
  { status: "dicuci", description: "Sudah dijemput, sedang diproses." },
  { status: "siap", description: "Selesai dicuci, menunggu driver." },
  { status: "selesai", description: "Pesanan diterima pelanggan." },
];

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
  const { toast } = useToast();
  const [selected, setSelected] = useState<OrderStatus>(order.status);

  const driver = users.find((user) => user.id === order.driverId);
  const zone = zones.find((item) => item.id === order.zoneId);

  function handleSave() {
    const result = updateOrderStatus(order.code, selected);
    if (!result.ok) {
      toast({ title: result.error, tone: "error" });
      return;
    }
    toast({ title: "Status pesanan diperbarui." });
    onSaved();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Ubah status pesanan"
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
            Batal
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            Simpan status
          </Button>
        </div>
      }
    >
      <ol className="border-t border-ink">
        {statusOptions.map((option, index) => {
          const active = selected === option.status;
          return (
            <li key={option.status}>
              <button
                type="button"
                onClick={() => setSelected(option.status)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-rule px-3.5 py-3.5 text-left transition-colors duration-[var(--dur-micro)]",
                  active
                    ? "bg-accent-soft shadow-[inset_2px_0_0_var(--color-accent)]"
                    : "hover:bg-paper-2",
                )}
              >
                <span className="small-print w-6 shrink-0 pt-0.5 text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center border-2",
                    active ? "border-accent bg-accent" : "border-rule bg-paper",
                  )}
                  aria-hidden="true"
                >
                  {active ? (
                    <span className="h-1 w-1 bg-accent-ink" />
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      active ? "text-accent" : "text-ink",
                    )}
                  >
                    {statusLabels[option.status]}
                  </span>
                  <span className="mt-0.5 block text-13 text-muted">
                    {option.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-13 leading-relaxed text-muted">
        Status baru ikut terkirim ke pelanggan lewat WhatsApp. Hanya admin dan
        driver terkait yang dapat mengubah status.
      </p>

      <BlockLabel>Ringkasan pesanan</BlockLabel>
      <dl className="mt-2">
        <DetailRow
          label="Pelanggan"
          value={`${order.customerName}, ${order.phone}`}
        />
        <DetailRow
          label="Jadwal"
          value={`${formatDateKey(orderDate(order))}, ${order.schedule}, ${sessionLabel(
            order.session,
          )}`}
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
