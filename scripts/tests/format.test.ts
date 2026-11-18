import { test } from "node:test";
import assert from "node:assert/strict";

import {
  addDaysToKey,
  formatDateKeyLong,
  formatOrderCode,
  formatPhone,
  isSessionActive,
  isValidPhone,
  nextOrderCode,
  normalizePhone,
  orderArrivalKey,
  parseScheduleTime,
  tierLabel,
  timeToMinutes,
  todayKey,
} from "@/lib/format";
import type { Order, ServiceTier } from "@/lib/types";

test("normalizePhone strips everything that is not a digit", () => {
  assert.equal(normalizePhone("0812-1000-0001"), "081210000001");
  assert.equal(normalizePhone("+62 812 1000 0001"), "6281210000001");
});

test("formatPhone groups as 4-4-rest", () => {
  assert.equal(formatPhone("081210000001"), "0812-1000-0001");
});

test("formatPhone leaves values shorter than 10 digits alone", () => {
  assert.equal(formatPhone("0812"), "0812");
});

test("isValidPhone accepts the local and country-code forms", () => {
  for (const value of ["081210000001", "+6281210000001", "6281210000001"]) {
    assert.equal(isValidPhone(value), true, value);
  }
});

test("isValidPhone rejects malformed numbers", () => {
  for (const value of ["12345", "0812", "+15551234567"]) {
    assert.equal(isValidPhone(value), false, value);
  }
});

test("parseScheduleTime normalises dots and colons", () => {
  assert.equal(parseScheduleTime("14.00"), "14.00");
  assert.equal(parseScheduleTime("9:05"), "09.05");
});

test("parseScheduleTime rejects impossible values", () => {
  assert.equal(parseScheduleTime("25:00"), null);
  assert.equal(parseScheduleTime("14:70"), null);
  assert.equal(parseScheduleTime("besok pagi"), null);
});

test("timeToMinutes converts a session time", () => {
  assert.equal(timeToMinutes("12.00"), 720);
  assert.equal(timeToMinutes("17.00"), 1020);
});

test("the demo clock sits inside the pickup window only", () => {
  // DEMO_NOW is 14.00 WIB. Pickup 12.00-17.00, delivery 17.00-22.00.
  assert.equal(isSessionActive("12.00", "17.00"), true);
  assert.equal(isSessionActive("17.00", "22.00"), false);
});

test("addDaysToKey crosses month boundaries without touching the clock", () => {
  assert.equal(addDaysToKey("2026-11-04", 1), "2026-11-05");
  assert.equal(addDaysToKey("2026-11-30", 1), "2026-12-01");
});

test("todayKey reads the frozen demo clock", () => {
  assert.equal(todayKey(), "2026-11-04");
});

// --- order codes -----------------------------------------------------------

function order(code: string, overrides: Partial<Order> = {}): Order {
  return {
    code,
    customerName: "Adinda Putri",
    phone: "0812-1000-0001",
    service: "Cuci Kering Setrika",
    weight: "3 kg",
    total: 0,
    zoneId: "Z1",
    schedule: "14.00",
    landmark: "Kos Mawar",
    status: "menunggu",
    createdAt: "2026-11-04T07:00:00.000Z",
    history: [],
    ...overrides,
  };
}

test("nextOrderCode starts a fresh day at 001", () => {
  assert.equal(nextOrderCode("Z1", []), "Z1-261104-001");
});

test("nextOrderCode continues after the highest sequence", () => {
  const orders = ["001", "002", "004"].map((n) => order(`Z1-261104-${n}`));
  assert.equal(nextOrderCode("Z1", orders), "Z1-261104-005");
});

test("nextOrderCode does not reuse the code of a deleted order", () => {
  const orders = [
    order("Z1-261104-001"),
    order("Z1-261104-002", { deletedAt: "2026-11-04T08:00:00.000Z" }),
  ];
  assert.equal(nextOrderCode("Z1", orders), "Z1-261104-003");
});

test("nextOrderCode skips a manually duplicated candidate", () => {
  // Max is 004, but 005 is already taken out of order.
  const orders = [
    order("Z1-261104-004"),
    order("Z1-261104-005"),
    order("Z1-261104-002"),
  ];
  assert.equal(nextOrderCode("Z1", orders), "Z1-261104-006");
});

test("nextOrderCode counts only the requested zone and day", () => {
  const orders = [
    order("Z2-261104-009"),
    order("Z1-261103-009"),
    order("Z1-261104-002"),
  ];
  assert.equal(nextOrderCode("Z1", orders), "Z1-261104-003");
  assert.equal(nextOrderCode("Z3", orders), "Z3-261104-001");
});

test("nextOrderCode always produces the documented format", () => {
  const code = nextOrderCode("Z2", [order("Z2-261104-001")]);
  assert.match(code, /^Z[123]-\d{6}-\d{3}$/);
  assert.equal(code, formatOrderCode("Z2", new Date("2026-11-04T07:00:00Z"), 2));
});

test("nextOrderCode accepts an explicit intake date", () => {
  const tomorrow = new Date("2026-11-05T07:00:00Z");
  assert.equal(nextOrderCode("Z1", [order("Z1-261104-007")], tomorrow), "Z1-261105-001");
});

test("tierLabel covers every tier", () => {
  const pairs: [ServiceTier, string][] = [
    ["reguler", "Reguler"],
    ["express", "Express"],
    ["kilat", "Kilat"],
  ];
  for (const [tier, label] of pairs) assert.equal(tierLabel(tier), label);
});

test("formatDateKeyLong reads a WIB calendar day", () => {
  assert.equal(formatDateKeyLong("2026-11-04"), "Rabu, 4 November 2026");
  assert.equal(formatDateKeyLong("2026-11-05"), "Kamis, 5 November 2026");
});

test("orderArrivalKey is two days after the scheduled day, not the intake day", () => {
  const scheduled = order("Z1-261104-001", { scheduleDate: "2026-11-05" });
  assert.equal(orderArrivalKey(scheduled), "2026-11-07");
});

test("orderArrivalKey falls back to createdAt for pre-MNI-5 rows", () => {
  assert.equal(orderArrivalKey(order("Z1-261104-001")), "2026-11-06");
});
