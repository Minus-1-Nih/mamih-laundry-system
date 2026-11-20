import { test } from "node:test";
import assert from "node:assert/strict";

import {
  passwordRules,
  sanitizeNameInput,
  validateFullName,
  validatePassword,
} from "@/lib/register-validation";

test("full name accepts letters, spaces and common name punctuation", () => {
  assert.equal(validateFullName("Adinda Putri"), null);
  assert.equal(validateFullName("Muh. Rizky"), null);
  assert.equal(validateFullName("Nur'aini Siti-Rahma"), null);
});

test("full name rejects digits and symbols", () => {
  assert.match(validateFullName("Adinda 2") ?? "", /hanya boleh berisi huruf/);
  assert.match(validateFullName("Adinda@") ?? "", /hanya boleh berisi huruf/);
  assert.match(validateFullName(".Adinda") ?? "", /hanya boleh berisi huruf/);
});

test("full name is required", () => {
  assert.equal(validateFullName("  "), "Nama lengkap wajib diisi.");
  assert.equal(validateFullName("A"), "Nama lengkap wajib diisi.");
});

test("typing strips digits from the name field", () => {
  assert.equal(sanitizeNameInput("Adi123nda Pu#tri"), "Adinda Putri");
});

test("password needs 6+ chars with letter, digit and symbol", () => {
  assert.equal(validatePassword("abc12!"), null);
  assert.match(validatePassword("ab1!") ?? "", /minimal 6/);
  assert.match(validatePassword("abcdef1") ?? "", /huruf, angka, dan simbol/);
  assert.match(validatePassword("abcdef!") ?? "", /huruf, angka, dan simbol/);
  assert.match(validatePassword("12345!") ?? "", /huruf, angka, dan simbol/);
});

test("password rules report each requirement", () => {
  assert.deepEqual(passwordRules("a1"), {
    length: false,
    letter: true,
    digit: true,
    symbol: false,
  });
});
