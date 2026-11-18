import { test } from "node:test";
import assert from "node:assert/strict";

import { FALLBACK_APP_URL, appBaseUrl, trackingUrl } from "@/lib/constants";
import { orderConfirmationMessage } from "@/lib/order-messages";
import type { OperationalSession, Order } from "@/lib/types";

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

function order(overrides: Partial<Order> = {}): Order {
  return {
    code: "Z1-261104-016",
    customerName: "Adinda Putri",
    phone: "0812-1000-0001",
    service: "Cuci Kering Setrika",
    weight: "3 kg",
    total: 0,
    zoneId: "Z1",
    schedule: "14.00",
    scheduleDate: "2026-11-05",
    tier: "express",
    landmark: "Kos Mawar",
    status: "menunggu",
    createdAt: "2026-11-04T07:00:00.000Z",
    history: [],
    ...overrides,
  };
}

const BASE = "http://localhost:3000";

function message(overrides: Partial<Order> = {}): string {
  return orderConfirmationMessage(order(overrides), BASE, sessions);
}

test("trackingUrl builds the public route", () => {
  assert.equal(
    trackingUrl("Z1-261104-016", BASE),
    "http://localhost:3000/tracking?kode=Z1-261104-016",
  );
});

test("trackingUrl trims a trailing slash and encodes the code", () => {
  assert.equal(
    trackingUrl("Z 1/016", `${BASE}/`),
    "http://localhost:3000/tracking?kode=Z%201%2F016",
  );
});

test("appBaseUrl falls back to localhost outside the browser", () => {
  assert.equal(appBaseUrl(), FALLBACK_APP_URL);
});

test("the confirmation greets the customer and carries the code", () => {
  const text = message();
  assert.match(text, /^Halo Adinda Putri, pesanan Laundria Anda sudah tercatat\./);
  assert.match(text, /^Kode: Z1-261104-016$/m);
});

test("the confirmation prints both legs of the cycle", () => {
  const text = message();
  assert.match(text, /^Penjemputan: Besok · 14\.00 WIB$/m);
  assert.match(text, /^Pengantaran: 6 Nov · 17\.00-21\.00 WIB$/m);
});

test("the delivery leg follows the package turnaround", () => {
  assert.match(
    message({ tier: "reguler" }),
    /^Pengantaran: 7 Nov · 17\.00-21\.00 WIB$/m,
  );
});

test("an explicit delivery date wins over the turnaround", () => {
  assert.match(
    message({ deliveryDate: "2026-11-04" }),
    /^Pengantaran: Hari ini · 17\.00-21\.00 WIB$/m,
  );
});

test("the declared session windows are used verbatim", () => {
  const custom: OperationalSession[] = sessions.map((session) =>
    session.type === "delivery"
      ? { ...session, start: "09.00", end: "17.00" }
      : session,
  );
  const text = orderConfirmationMessage(order(), BASE, custom);
  assert.match(text, /^Pengantaran: 6 Nov · 09\.00-17\.00 WIB$/m);
});

test("the confirmation includes the tracking URL exactly once", () => {
  const text = message();
  assert.equal(text.split("Lacak:").length - 1, 1);
  assert.ok(
    text.includes("Lacak: http://localhost:3000/tracking?kode=Z1-261104-016"),
  );
});

test("the confirmation asks for a reply", () => {
  assert.match(message(), /Balas YA untuk konfirmasi\.$/);
});

test("a tiered service shows its tier", () => {
  assert.match(
    message({ tier: "kilat" }),
    /^Layanan: Cuci Kering Setrika · Kilat$/m,
  );
});

test("an untiered service omits the tier separator", () => {
  assert.match(
    message({ service: "Cuci Sepatu", tier: undefined }),
    /^Layanan: Cuci Sepatu$/m,
  );
});

test("the confirmation carries no price, phone, or landmark", () => {
  const text = message();
  assert.ok(!/Rp|\d{3}\.\d{3}/.test(text), "price leaked");
  assert.ok(!text.includes("0812-1000-0001"), "phone leaked");
  assert.ok(!text.includes("Kos Mawar"), "landmark leaked");
});

test("a later schedule date is printed instead of the intake day", () => {
  assert.match(
    message({ scheduleDate: "2026-11-09" }),
    /^Penjemputan: 9 Nov · 14\.00 WIB$/m,
  );
});
