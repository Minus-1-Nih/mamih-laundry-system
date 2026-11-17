import { trackingUrl } from "@/lib/constants";
import { orderDate, scheduleDateLabel, tierLabel } from "@/lib/format";
import type { Order } from "@/lib/types";

/**
 * The one customer-facing confirmation. The admin sends it from their own
 * WhatsApp, so the text carries what the customer needs to act on: the code,
 * what was booked, when, and a link to the public tracking page.
 *
 * Deliberately absent: price (the weighing story owns totals), phone, address,
 * and internal notes. `baseUrl` is an argument rather than a `window` read so
 * the message can be built and asserted outside a browser.
 */
export function orderConfirmationMessage(order: Order, baseUrl: string): string {
  const service = order.tier
    ? `${order.service} · ${tierLabel(order.tier)}`
    : order.service;
  const schedule = `${scheduleDateLabel(orderDate(order))} · ${order.schedule} WIB`;

  return [
    `Halo ${order.customerName}, pesanan Laundria Anda sudah tercatat.`,
    "",
    `Kode: ${order.code}`,
    `Layanan: ${service}`,
    `Jadwal: ${schedule}`,
    `Lacak: ${trackingUrl(order.code, baseUrl)}`,
    "",
    "Balas YA untuk konfirmasi.",
  ].join("\n");
}
