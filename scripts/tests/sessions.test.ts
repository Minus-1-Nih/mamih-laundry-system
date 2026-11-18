import { test } from "node:test";
import assert from "node:assert/strict";

import { DEMO_NOW } from "@/lib/demo-date";
import {
  deliveryDateFor,
  isSessionActive,
  turnaroundDays,
} from "@/lib/format";
import {
  bookable,
  closedHours,
  legFor,
  nextPickupDate,
  nextSessionDate,
  planAllocation,
  serviceHours,
  sessionUsed,
} from "@/lib/sessions";
import type {
  OperationalSession,
  Order,
  OrderStatus,
  SessionType,
} from "@/lib/types";

const sessions: OperationalSession[] = [
  {
    type: "pickup",
    start: "08.00",
    cutoff: "16.00",
    end: "17.00",
    capacity: 20,
    open: true,
  },
  {
    type: "delivery",
    start: "17.00",
    cutoff: "16.00",
    end: "21.00",
    capacity: 12,
    open: true,
  },
];

function withCapacity(
  type: SessionType,
  capacity: number,
  open = true,
): OperationalSession[] {
  return sessions.map((session) =>
    session.type === type ? { ...session, capacity, open } : session,
  );
}

function nowAt(time: string): Date {
  return new Date(`2026-11-04T${time}:00+07:00`);
}

function order(overrides: Partial<Order> = {}): Order {
  return {
    code: "Z1-261104-001",
    customerName: "Adinda Putri",
    phone: "0812-1000-0001",
    service: "Cuci Kering Setrika",
    weight: "3 kg",
    total: 0,
    zoneId: "Z1",
    schedule: "14.00",
    scheduleDate: "2026-11-04",
    deliveryDate: "2026-11-06",
    tier: "reguler",
    landmark: "Kos Mawar",
    status: "menunggu",
    createdAt: "2026-11-04T07:00:00.000Z",
    history: [],
    ...overrides,
  };
}

/** Orders that occupy `date` on one leg, enough to fill a small capacity. */
function occupying(type: SessionType, date: string, count: number): Order[] {
  return Array.from({ length: count }, (_, index) =>
    order({
      code: `Z1-261104-${String(index + 1).padStart(3, "0")}`,
      scheduleDate: type === "pickup" ? date : "2026-11-04",
      deliveryDate: type === "delivery" ? date : "2026-11-06",
    }),
  );
}

test("turnaroundDays maps every package, and defaults to reguler", () => {
  assert.equal(turnaroundDays("reguler"), 2);
  assert.equal(turnaroundDays("express"), 1);
  assert.equal(turnaroundDays("kilat"), 1);
  assert.equal(turnaroundDays(undefined), 2);
});

test("deliveryDateFor crosses a month boundary", () => {
  assert.equal(deliveryDateFor("2026-11-30", "reguler"), "2026-12-02");
  assert.equal(deliveryDateFor("2026-11-30", "express"), "2026-12-01");
});

test("the pickup window is half-open: 16.59 is pickup, 17.00 is delivery", () => {
  assert.equal(isSessionActive("08.00", "17.00", 16 * 60 + 59), true);
  assert.equal(isSessionActive("08.00", "17.00", 17 * 60), false);
  assert.equal(isSessionActive("17.00", "21.00", 17 * 60), true);
});

test("the cutoff is strict: 15.59 is bookable, 16.00 is not", () => {
  assert.equal(
    bookable("2026-11-04", "pickup", sessions, [], nowAt("15:59")).ok,
    true,
  );
  const refused = bookable("2026-11-04", "pickup", sessions, [], nowAt("16:00"));
  assert.equal(refused.ok, false);
  if (!refused.ok) {
    assert.match(refused.reason, /Batas konfirmasi sesi hari ini 16\.00/);
  }
});

test("capacity accepts the last slot and refuses the next one", () => {
  const small = withCapacity("pickup", 15);
  assert.equal(
    bookable("2026-11-04", "pickup", small, occupying("pickup", "2026-11-04", 14), DEMO_NOW)
      .ok,
    true,
  );
  assert.equal(
    bookable("2026-11-04", "pickup", small, occupying("pickup", "2026-11-04", 15), DEMO_NOW)
      .ok,
    false,
  );
});

test("a closed session is refused even when it has room", () => {
  const closed = withCapacity("pickup", 20, false);
  const result = bookable("2026-11-04", "pickup", closed, [], DEMO_NOW);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.reason, /sedang tutup/);
});

test("roll-forward skips a full day and a day past its cutoff", () => {
  const full = withCapacity("pickup", 1);
  assert.equal(
    nextSessionDate(
      "pickup",
      full,
      occupying("pickup", "2026-11-04", 1),
      "2026-11-04",
      DEMO_NOW,
    ),
    "2026-11-05",
  );
  assert.equal(
    nextSessionDate("pickup", sessions, [], "2026-11-04", nowAt("16:30")),
    "2026-11-05",
  );
});

test("seven full days exhaust the allocation horizon", () => {
  const full = withCapacity("pickup", 1);
  const week = Array.from({ length: 7 }, (_, offset) => {
    const day = `2026-11-${String(offset + 4).padStart(2, "0")}`;
    return occupying("pickup", day, 1)[0];
  });
  assert.equal(
    nextSessionDate("pickup", full, week, "2026-11-04", DEMO_NOW),
    null,
  );
});

test("a full delivery day rolls forward on its own", () => {
  const full = withCapacity("delivery", 1);
  const booked = occupying("delivery", "2026-11-05", 1);
  assert.equal(
    nextSessionDate("delivery", full, booked, "2026-11-05", DEMO_NOW),
    "2026-11-06",
  );
});

test("nextPickupDate skips a pickup whose delivery day is full", () => {
  const full = withCapacity("delivery", 1);
  const booked = occupying("delivery", "2026-11-06", 1);
  const next = nextPickupDate(
    full,
    booked,
    "2026-11-04",
    DEMO_NOW,
    (pickupDate) => deliveryDateFor(pickupDate, "reguler"),
  );
  assert.deepEqual(next, {
    pickupDate: "2026-11-05",
    deliveryDate: "2026-11-07",
  });
});

test("moving delivery earlier than the turnaround is refused", () => {
  const result = planAllocation(
    order(),
    { deliveryDate: "2026-11-05" },
    sessions,
    [order()],
    DEMO_NOW,
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /minimal 2 hari/);
});

test("moving pickup later also moves the delivery leg", () => {
  const result = planAllocation(
    order(),
    { pickupDate: "2026-11-05" },
    sessions,
    [order()],
    DEMO_NOW,
  );
  assert.deepEqual(result, {
    ok: true,
    pickupDate: "2026-11-05",
    deliveryDate: "2026-11-07",
  });
});

test("legFor follows the status through all four stages", () => {
  const statuses: [OrderStatus, SessionType][] = [
    ["menunggu", "pickup"],
    ["dicuci", "pickup"],
    ["siap", "delivery"],
    ["selesai", "delivery"],
  ];
  for (const [status, leg] of statuses) {
    assert.equal(legFor(order({ status })), leg, status);
  }
});

test("sessionUsed ignores deleted orders and counts finished ones", () => {
  const orders = [
    order({ status: "menunggu" }),
    order({
      code: "Z1-261104-002",
      status: "selesai",
      scheduleDate: "2026-11-03",
    }),
    order({ code: "Z1-261104-003", deletedAt: "2026-11-04T08:00:00.000Z" }),
    order({ code: "Z1-261104-004", status: "siap" }),
  ];
  assert.equal(sessionUsed(orders, "pickup", "2026-11-04"), 2);
  assert.equal(sessionUsed(orders, "delivery", "2026-11-06"), 3);
});

test("serviceHours and closedHours are derived from the session config", () => {
  assert.equal(serviceHours(sessions), "08.00-21.00 WIB");
  assert.equal(closedHours(sessions), "21.00-08.00 WIB");
});
