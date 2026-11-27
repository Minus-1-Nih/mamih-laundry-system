import { test } from "node:test";
import assert from "node:assert/strict";

import {
  ADDRESS_LIMIT,
  addAddress,
  addressesFor,
  filterAddresses,
  removeAddress,
  setPrimaryAddress,
  updateAddress,
  validateAddressDraft,
  type AddressDraft,
} from "@/lib/addresses";
import { seedAddresses } from "@/lib/seed";

const draft: AddressDraft = {
  label: "Kos",
  address: "  Jl. Ciganitri No. 3, Kos Melati ",
  note: " Pagar putih ",
  zoneId: "Z3",
};

test("draft needs a real address", () => {
  assert.equal(validateAddressDraft(draft), null);
  assert.match(validateAddressDraft({ ...draft, address: " " }) ?? "", /wajib/);
  assert.match(validateAddressDraft({ ...draft, address: "Jl. A" }) ?? "", /singkat/);
});

test("adding trims fields, keeps the chosen zone, and is not primary when others exist", () => {
  const result = addAddress(seedAddresses, "u-adinda", draft, "addr-new");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.address.address, "Jl. Ciganitri No. 3, Kos Melati");
  assert.equal(result.address.note, "Pagar putih");
  assert.equal(result.address.zoneId, "Z3");
  assert.equal(result.address.primary, false);
});

test("a customer's first address becomes primary", () => {
  const result = addAddress(seedAddresses, "u-baru", draft, "addr-first");
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.address.primary, true);
});

test("adding stops at the address limit", () => {
  let list = seedAddresses;
  for (let i = addressesFor(list, "u-adinda").length; i < ADDRESS_LIMIT; i++) {
    const result = addAddress(list, "u-adinda", draft, `addr-${i}`);
    assert.equal(result.ok, true);
    if (result.ok) list = result.addresses;
  }
  const over = addAddress(list, "u-adinda", draft, "addr-over");
  assert.equal(over.ok, false);
});

test("update can move an address to another zone", () => {
  const result = updateAddress(seedAddresses, "u-adinda", "addr-adinda-kos", draft);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const kos = result.addresses.find((item) => item.id === "addr-adinda-kos");
  assert.equal(kos?.zoneId, "Z3");
});

test("a customer cannot touch another customer's address", () => {
  assert.equal(updateAddress(seedAddresses, "u-lain", "addr-adinda-kos", draft).ok, false);
  assert.equal(removeAddress(seedAddresses, "u-lain", "addr-adinda-kos").ok, false);
  assert.equal(setPrimaryAddress(seedAddresses, "u-lain", "addr-adinda-kos").ok, false);
});

test("removing the primary address promotes the next one", () => {
  const result = removeAddress(seedAddresses, "u-adinda", "addr-adinda-rumah");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const own = addressesFor(result.addresses, "u-adinda");
  assert.equal(own.length, 2);
  assert.equal(own.filter((item) => item.primary).length, 1);
});

test("setting primary leaves exactly one primary, listed first", () => {
  const result = setPrimaryAddress(seedAddresses, "u-adinda", "addr-adinda-kantor");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const own = addressesFor(result.addresses, "u-adinda");
  assert.equal(own[0].id, "addr-adinda-kantor");
  assert.equal(own.filter((item) => item.primary).length, 1);
});

test("filter narrows by zone and by search text", () => {
  const own = addressesFor(seedAddresses, "u-adinda");
  assert.equal(filterAddresses(own, "semua", "").length, own.length);
  assert.deepEqual(
    filterAddresses(own, "Z2", "").map((item) => item.id),
    ["addr-adinda-kantor"],
  );
  assert.equal(filterAddresses(own, "Z3", "").length, 0);
  assert.deepEqual(
    filterAddresses(own, "semua", "anggrek").map((item) => item.id),
    ["addr-adinda-kos"],
  );
});
