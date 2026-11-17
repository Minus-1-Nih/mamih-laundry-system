import { test } from "node:test";
import assert from "node:assert/strict";

import { FALLBACK_APP_URL, appBaseUrl, trackingUrl } from "@/lib/constants";
import { orderConfirmationMessage } from "@/lib/order-messages";
import type { Order } from "@/lib/types";

function order(overrides: Partial<Order> = {}): Order {
  return {
    code: "Z1-261104-016",
    customerName: "Adinda Putri",
    phone: "0812-1000-0001",
    service: "Cuci Kering Setrika",
    weight: "3 kg",
    total: 0,
    zoneId: "Z1",
    session: "pickup",
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
  const message = orderConfirmationMessage(order(), BASE);
  assert.match(message, /^Halo Adinda Putri, pesanan Laundria Anda sudah tercatat\./);
  assert.match(message, /^Kode: Z1-261104-016$/m);
});

test("the confirmation uses the relative schedule date", () => {
  const message = orderConfirmationMessage(order(), BASE);
  assert.match(message, /^Jadwal: Besok · 14\.00 WIB$/m);
});

test("the confirmation includes the tracking URL exactly once", () => {
  const message = orderConfirmationMessage(order(), BASE);
  assert.equal(message.split("Lacak:").length - 1, 1);
  assert.ok(
    message.includes("Lacak: http://localhost:3000/tracking?kode=Z1-261104-016"),
  );
});

test("the confirmation asks for a reply", () => {
  assert.match(
    orderConfirmationMessage(order(), BASE),
    /Balas YA untuk konfirmasi\.$/,
  );
});

test("a tiered service shows its tier", () => {
  assert.match(
    orderConfirmationMessage(order({ tier: "kilat" }), BASE),
    /^Layanan: Cuci Kering Setrika · Kilat$/m,
  );
});

test("an untiered service omits the tier separator", () => {
  const message = orderConfirmationMessage(
    order({ service: "Cuci Sepatu", tier: undefined }),
    BASE,
  );
  assert.match(message, /^Layanan: Cuci Sepatu$/m);
});

test("the confirmation carries no price, phone, or landmark", () => {
  const message = orderConfirmationMessage(order(), BASE);
  assert.ok(!/Rp|\d{3}\.\d{3}/.test(message), "price leaked");
  assert.ok(!message.includes("0812-1000-0001"), "phone leaked");
  assert.ok(!message.includes("Kos Mawar"), "landmark leaked");
});

test("a later schedule date is printed instead of the intake day", () => {
  const message = orderConfirmationMessage(
    order({ scheduleDate: "2026-11-09" }),
    BASE,
  );
  assert.match(message, /^Jadwal: 9 Nov · 14\.00 WIB$/m);
});
