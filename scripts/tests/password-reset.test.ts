import { test } from "node:test";
import assert from "node:assert/strict";

import { findCustomerForReset, phoneDigits } from "@/lib/password-reset";
import { seedUsers } from "@/lib/seed";

test("phone digits ignore separators and +62 prefix", () => {
  assert.equal(phoneDigits("0813-0000-0001"), "081300000001");
  assert.equal(phoneDigits("+62 813 0000 0001"), "081300000001");
});

test("customer is found by email and matching phone", () => {
  const result = findCustomerForReset(seedUsers, " Adinda.Putri@gmail.com ", "+6281300000001");
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.user.id, "u-adinda");
});

test("wrong phone is rejected", () => {
  const result = findCustomerForReset(seedUsers, "adinda.putri@gmail.com", "0812-9999-9999");
  assert.equal(result.ok, false);
});

test("staff accounts cannot reset through the customer flow", () => {
  const staff = seedUsers.find((user) => user.role !== "customer")!;
  const result = findCustomerForReset(seedUsers, staff.email, staff.phone);
  assert.equal(result.ok, false);
});

test("inactive customer is told to contact Admin", () => {
  const users = seedUsers.map((user) =>
    user.id === "u-adinda" ? { ...user, active: false } : user,
  );
  const result = findCustomerForReset(users, "adinda.putri@gmail.com", "0813-0000-0001");
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /nonaktif/);
});
