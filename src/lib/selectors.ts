import {
  canonicalPhone,
  isOverdue,
  isToday,
  orderDate,
} from "@/lib/format";
import type { Order, OrderStatus, ZoneId } from "@/lib/types";

export function visibleOrders(orders: Order[]): Order[] {
  return orders.filter((order) => !order.deletedAt);
}

export function todayOrders(orders: Order[]): Order[] {
  return visibleOrders(orders).filter((order) => isToday(order.createdAt));
}

/**
 * The admin order list keeps today's orders plus any unfinished order from an
 * earlier day, so outlet work cannot fall off the screen.
 */
export function workingOrders(orders: Order[]): Order[] {
  return visibleOrders(orders).filter(
    (order) => isToday(order.createdAt) || order.status !== "selesai",
  );
}

export function customerOrders(orders: Order[], customerId: string): Order[] {
  return visibleOrders(orders)
    .filter((order) => order.customerId === customerId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

/**
 * A driver's completed legs. Per-leg attribution keeps the pickup credit even
 * when another driver takes the delivery.
 */
export function driverHistory(
  orders: Order[],
  driverId: string,
): Order[] {
  return visibleOrders(orders)
    .filter((order) => {
      const pickupBy =
        order.pickupDriverId ??
        (order.status !== "menunggu" ? order.driverId : undefined);
      const deliveryBy =
        order.deliveryDriverId ??
        (order.status === "selesai" ? order.driverId : undefined);
      return (
        (order.status === "dicuci" && pickupBy === driverId) ||
        (order.status === "selesai" &&
          (deliveryBy === driverId || pickupBy === driverId))
      );
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

/** Normalised phone + schedule date + schedule time, the duplicate key. */
export function findSimilarOrder(
  orders: Order[],
  key: { phone: string; scheduleDate: string; schedule: string },
): Order | undefined {
  const phone = canonicalPhone(key.phone);
  if (!phone || !key.scheduleDate || !key.schedule) return undefined;
  return visibleOrders(orders).find(
    (order) =>
      canonicalPhone(order.phone) === phone &&
      orderDate(order) === key.scheduleDate &&
      order.schedule === key.schedule,
  );
}

function completedAt(order: Order): number {
  const last = [...order.history]
    .reverse()
    .find((event) => event.status === "selesai" || event.status === "dicuci");
  return new Date(last?.at ?? order.createdAt).getTime();
}

export function driverZoneHistory(
  orders: Order[],
  zoneIds: ZoneId[],
): Order[] {
  return visibleOrders(orders)
    .filter(
      (order) =>
        zoneIds.includes(order.zoneId) &&
        (order.status === "selesai" || order.status === "dicuci"),
    )
    .sort((a, b) => completedAt(b) - completedAt(a));
}

export function countStatus(orders: Order[], status: OrderStatus): number {
  return orders.filter((order) => order.status === status).length;
}

export function countZone(orders: Order[], zoneId: ZoneId): number {
  return orders.filter((order) => order.zoneId === zoneId).length;
}

export function overdueOrders(orders: Order[]): Order[] {
  return orders.filter((order) => isOverdue(order));
}

/** Ready orders that no courier has claimed for the delivery leg yet. */
export function readyWithoutDriver(orders: Order[]): Order[] {
  return orders.filter(
    (order) => order.status === "siap" && !order.assignedAt,
  );
}
