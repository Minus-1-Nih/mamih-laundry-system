import type { OrderStatus, Role } from "@/lib/types";

/**
 * Status moves forward one stage at a time. The outlet (admin/owner) records
 * the internal stages; the driver records pickup and delivery. Nobody can
 * rewind or skip, and `selesai` is terminal.
 */
export const ORDER_STATUSES: OrderStatus[] = [
  "menunggu",
  "dicuci",
  "siap",
  "selesai",
];

export const statusLabels: Record<OrderStatus, string> = {
  menunggu: "Menunggu Penjemputan",
  dicuci: "Sedang Dicuci",
  siap: "Siap Diantar",
  selesai: "Selesai",
};

export const statusDescriptions: Record<OrderStatus, string> = {
  menunggu: "Belum dijemput driver.",
  dicuci: "Sudah dijemput, sedang diproses di outlet.",
  siap: "Selesai dicuci, menunggu driver.",
  selesai: "Pesanan diterima pelanggan.",
};

/** Default history note when the caller does not supply one. */
export const statusNotes: Record<OrderStatus, string> = {
  menunggu: "Menunggu penjemputan",
  dicuci: "Mulai dicuci di outlet",
  siap: "Selesai dicuci, siap diantar",
  selesai: "Pesanan diterima pelanggan",
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  menunggu: "dicuci",
  dicuci: "siap",
  siap: "selesai",
  selesai: null,
};

export type StatusGate = { ok: true } | { ok: false; error: string };

/** The one forward step this role may record, or null when the order is locked. */
export function nextStatusFor(
  role: Role,
  current: OrderStatus,
): OrderStatus | null {
  const next = NEXT_STATUS[current];
  if (!next) return null;
  if (role === "customer") return null;
  // Delivery completion is the driver's record, never the outlet's.
  if (role === "admin" && next === "selesai") return null;
  // Outlet completion is the admin's record, never the driver's.
  if (role === "driver" && next === "siap") return null;
  return next;
}

export function canAdvance(
  role: Role,
  from: OrderStatus,
  to: OrderStatus,
): StatusGate {
  if (from === to) {
    return { ok: false, error: "Pesanan sudah berada di tahap ini." };
  }
  if (from === "selesai") {
    return { ok: false, error: "Pesanan sudah selesai dan tidak bisa diubah." };
  }

  const next = NEXT_STATUS[from];
  if (!next) {
    return { ok: false, error: "Pesanan sudah selesai dan tidak bisa diubah." };
  }
  if (to !== next) {
    return {
      ok: false,
      error: `Status hanya bisa maju satu tahap, ke ${statusLabels[next]}.`,
    };
  }

  if (role === "customer") {
    return {
      ok: false,
      error: "Hanya admin outlet dan driver yang dapat memperbarui status.",
    };
  }

  if (nextStatusFor(role, from) === next) {
    return { ok: true };
  }

  if (role === "driver") {
    return {
      ok: false,
      error: "Status siap diantar dicatat oleh admin outlet.",
    };
  }

  return {
    ok: false,
    error: "Penyelesaian pesanan dicatat oleh driver saat pengantaran.",
  };
}
