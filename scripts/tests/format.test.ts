import { test } from "node:test";
import assert from "node:assert/strict";

import {
  addDaysToKey,
  formatPhone,
  isSessionActive,
  isValidPhone,
  normalizePhone,
  parseScheduleTime,
  timeToMinutes,
  todayKey,
} from "@/lib/format";

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
