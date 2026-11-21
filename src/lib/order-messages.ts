import { trackingUrl } from "@/lib/constants";
import {
  orderDate,
  orderDeliveryDate,
  scheduleDateLabel,
  tierLabel,
} from "@/lib/format";
import { sessionWindowLabel } from "@/lib/sessions";
import type { OperationalSession, Order } from "@/lib/types";

/**
 * The one customer-facing confirmation. The admin sends it from their own
 * WhatsApp, so the text carries what the customer needs to act on: the code,
 * what was booked, both legs of the cycle, and a link to the public tracking
 * page.
 *
 * Deliberately absent: price (the weighing story owns totals), phone, address,
 * and internal notes. `baseUrl` and `sessions` are arguments rather than reads
 * so the message can be built and asserted outside a browser.
 */
export function orderConfirmationMessage(
  order: Order,
  baseUrl: string,
  sessions: OperationalSession[],
): string {
  const service = order.tier
    ? `${order.service}, ${tierLabel(order.tier)}`
    : order.service;
  const pickup = `${scheduleDateLabel(orderDate(order))}, ${order.schedule} WIB`;
  const delivery = `${scheduleDateLabel(orderDeliveryDate(order))}, ${sessionWindowLabel(
    "delivery",
    sessions,
  )}`;

  return [
    `Halo ${order.customerName}, pesanan Laundria Anda sudah tercatat.`,
    "",
    `Kode: ${order.code}`,
    `Layanan: ${service}`,
    `Penjemputan: ${pickup}`,
    `Pengantaran: ${delivery}`,
    `Lacak: ${trackingUrl(order.code, baseUrl)}`,
    "",
    "Balas YA untuk konfirmasi.",
  ].join("\n");
}
