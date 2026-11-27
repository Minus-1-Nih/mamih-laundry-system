import { test } from "node:test";
import assert from "node:assert/strict";

import {
  passwordResetHelp,
  passwordResetMessage,
} from "@/lib/auth-messages";
import { WHATSAPP_NUMBER, whatsappLink } from "@/lib/constants";

test("store WhatsApp number is the Mamih Laundry admin line", () => {
  assert.equal(WHATSAPP_NUMBER, "6285942570627");
});

test("customer reset help opens WhatsApp to Admin", () => {
  const help = passwordResetHelp("customer");
  assert.equal(help.channel, "whatsapp");
  if (help.channel !== "whatsapp") return;
  assert.equal(help.cta, "Hubungi Admin");
});

test("admin and driver reset help opens WhatsApp to Owner", () => {
  assert.equal(passwordResetHelp("admin").channel, "whatsapp");
  assert.equal(passwordResetHelp("driver").channel, "whatsapp");
  const admin = passwordResetHelp("admin");
  if (admin.channel !== "whatsapp") return;
  assert.equal(admin.cta, "Hubungi Owner");
});

test("owner reset help does not send WhatsApp to the owner", () => {
  const help = passwordResetHelp("owner");
  assert.equal(help.channel, "local");
  assert.match(help.heading, /tidak mereset kata sandi lewat WhatsApp/i);
});

test("customer reset message matches the recommended WhatsApp script", () => {
  const message = passwordResetMessage("customer", "adinda.putri@gmail.com");
  assert.match(message, /Halo Admin Mamih Laundry/);
  assert.match(message, /reset kata sandi akun pelanggan/);
  assert.match(message, /Akun: adinda.putri@gmail.com/);
});

test("customer reset message omits a blank account line", () => {
  assert.equal(
    passwordResetMessage("customer", "  "),
    "Halo Admin Mamih Laundry, saya ingin meminta bantuan untuk reset kata sandi akun pelanggan saya.",
  );
});

test("staff reset messages address Owner and keep the role", () => {
  assert.match(passwordResetMessage("admin", "admin"), /akun Admin/);
  assert.match(passwordResetMessage("driver", "rizky"), /akun Driver/);
  assert.match(passwordResetMessage("admin"), /Halo Owner Laundria/);
});

test("WhatsApp link encodes the reset message onto the admin number", () => {
  const message = passwordResetMessage("customer");
  const href = whatsappLink(message);
  assert.equal(href.startsWith("https://wa.me/6285942570627?text="), true);
  assert.equal(href.includes(encodeURIComponent(message)), true);
});
