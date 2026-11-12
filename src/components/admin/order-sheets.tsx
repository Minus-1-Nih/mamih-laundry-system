"use client";

import { useState, type ReactNode } from "react";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { StatusBadge, statusLabels } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { whatsappLinkTo } from "@/lib/constants";
import {
  formatDateShort,
  formatDateTime,
  sessionLabel,
} from "@/lib/format";
import { useAppStore } from "@/lib/store";
import type { Order, OrderStatus, User, Zone } from "@/lib/types";

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2.5 last:border-0">
      <dt className="shrink-0 text-13 text-muted">{label}</dt>
      <dd className="max-w-[62%] text-right text-sm font-medium text-ink">
        {value}
      </dd>
    </div>
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
  const wa = whatsappLinkTo(
    order.phone,
    `Halo ${order.customerName}, kami dari Laundria mengenai pesanan ${order.code}.`,
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
            className="border border-danger-fg/30 text-danger-fg hover:bg-danger-bg"
            onClick={onDelete}
          >
            Hapus
          </Button>
        </div>
      }
    >
      <p className="font-mono text-lg font-bold text-ink">{order.code}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <StatusBadge status={order.status} className="text-13" />
        <span className="text-13 text-muted">
          Dibuat {formatDateTime(order.createdAt)} WIB
        </span>
      </div>

      <p className="mt-5 text-13 text-muted">Pelanggan</p>
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-canvas p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {order.customerName}
          </p>
          <p className="text-13 text-muted">{order.phone}</p>
        </div>
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center rounded-lg border border-primary/30 bg-surface px-3 text-13 font-medium text-primary transition-colors hover:bg-secondary"
        >
          Chat WhatsApp
        </a>
      </div>

      <h3 className="mt-5 text-sm font-semibold text-ink">Rincian pesanan</h3>
      <dl className="mt-1">
        <DetailRow label="Layanan" value={order.service} />
        <DetailRow label="Berat" value={order.weight} />
        <DetailRow
          label="Zona"
          value={`${order.zoneId}, ${zone?.name ?? ""}`}
        />
        <DetailRow label="Sesi" value={sessionLabel(order.session)} />
        <DetailRow label="Jadwal" value={`${order.schedule} WIB`} />
        <DetailRow label="Patokan" value={order.landmark} />
        <DetailRow
          label="Driver"
          value={driver?.name ?? "Belum ditugaskan"}
        />
        {order.note ? <DetailRow label="Catatan" value={order.note} /> : null}
      </dl>

      <h3 className="mt-5 text-sm font-semibold text-ink">Riwayat status</h3>
      <div className="mt-3">
        <OrderTimeline order={order} variant="admin" />
      </div>
      <p className="mt-4 rounded-lg bg-canvas px-3 py-2.5 text-13 text-muted">
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
      description={`${order.code}  ${order.customerName}, ${order.zoneId} ${
        zone?.name ?? ""
      }`}
      size="lg"
      footer={
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1 border border-border"
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
      <div className="space-y-2.5">
        {statusOptions.map((option) => {
          const active = selected === option.status;
          return (
            <button
              key={option.status}
              type="button"
              onClick={() => setSelected(option.status)}
              aria-pressed={active}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                active
                  ? "border-primary bg-secondary"
                  : "border-border bg-surface hover:border-primary/40",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  active ? "border-primary" : "border-border",
                )}
              >
                {active ? (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="text-sm font-medium text-ink">
                  {statusLabels[option.status]}
                </span>
                <span className="mt-0.5 block text-13 text-muted">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-13 leading-relaxed text-muted">
        Status baru ikut terkirim ke pelanggan lewat WhatsApp. Hanya admin dan
        driver terkait yang dapat mengubah status.
      </p>

      <h3 className="mt-5 text-sm font-semibold text-ink">
        Ringkasan pesanan
      </h3>
      <dl className="mt-1">
        <DetailRow
          label="Pelanggan"
          value={`${order.customerName}, ${order.phone}`}
        />
        <DetailRow
          label="Jadwal"
          value={`${formatDateShort(order.createdAt)}, ${order.schedule}, ${sessionLabel(
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
            className="flex-1 border border-border"
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
        <div className="mt-4 rounded-lg border border-waiting-fg/20 bg-waiting-bg px-3 py-2.5 text-13 leading-relaxed text-waiting-fg">
          Pesanan masih berjalan sebaiknya tidak dihapus. Perbarui lewat Ubah
          status, atau hubungi supervisor jika ini salah input.
        </div>
      ) : null}

      <h3 className="mt-5 text-sm font-semibold text-ink">
        Dampak penghapusan
      </h3>
      <div className="mt-2 rounded-xl border border-border bg-canvas p-4">
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
