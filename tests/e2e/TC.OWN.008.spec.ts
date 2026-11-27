import { test, expect, type Page } from "@playwright/test";
import path from "path";

/**
 * PBI-OWN-01
 * Test Case ID: TC.OWN.008
 * Skenario: Positive
 * Deskripsi: Owner mereset kata sandi akun karyawan
 * Prekondisi: Owner sudah login di /admin/akun. Akun Driver uji dibuat di
 *             dalam tes ini (akun seed tidak diubah).
 */

const selisih = (description: string) =>
  test.info().annotations.push({ type: "selisih", description });

async function loginOwner(page: Page) {
  await page.goto("/masuk/owner");
  await expect(page.getByRole("heading", { name: /Masuk sebagai Owner/i })).toBeVisible({
    timeout: 10000,
  });
  await page.fill("#identifier", "owner");
  await page.fill("#password", "owner123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 10000 });
}

async function createTestDriver(page: Page, name: string, username: string, password: string) {
  await page.getByRole("button", { name: /Tambah akun/i }).click();
  const drawer = page.getByRole("dialog", { name: "Tambah akun" });
  await expect(drawer).toBeVisible();
  await drawer.getByRole("button", { name: "Driver", exact: true }).click();
  await drawer.locator("#account-name").fill(name);
  await drawer.locator("#account-username").fill(username);
  await drawer.locator("#account-phone").fill("0812-9000-0008");
  await drawer.locator("#account-password").fill(password);
  await drawer.getByRole("button", { name: /^Z1,/ }).click();
  await drawer.getByRole("button", { name: "Buat akun" }).click();
  await expect(drawer).toBeHidden();
}

async function submitDriverLogin(page: Page, username: string, password: string) {
  await page.goto("/masuk/driver");
  await expect(page.getByRole("heading", { name: /Masuk sebagai Driver/i })).toBeVisible({
    timeout: 10000,
  });
  await page.fill("#identifier", username);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
}

test.describe("TC.OWN.008 - Reset kata sandi karyawan", () => {
  test("Owner mereset sandi Driver, Driver bisa masuk dengan sandi baru dan sandi lama ditolak", async ({
    page,
    isMobile,
  }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 1366, height: 860 });
    }
    const suffix = isMobile ? "-mobile" : "";
    const username = `drvuji${Date.now().toString(36)}`;
    const name = "Driver Uji 008";
    const oldPassword = "lama12345";
    const newPassword = "baru67890";

    await loginOwner(page);
    await page.goto("/admin/akun");
    await expect(page.getByRole("heading", { name: /Manajemen akun/i })).toBeVisible({
      timeout: 10000,
    });
    await createTestDriver(page, name, username, oldPassword);
    const row = page.locator("table tbody tr").filter({ hasText: `@${username}` });
    await expect(row).toHaveCount(1);

    // Langkah 1: klik aksi Reset kata sandi -> drawer meminta sandi baru
    await row.getByRole("button", { name: `Reset kata sandi ${name}` }).click();
    const modal = page.getByRole("dialog", { name: "Reset kata sandi" });
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(`@${username}`);
    await expect(modal.locator("#reset-password")).toBeVisible();
    await expect(modal.locator("#reset-confirm")).toBeVisible();
    selisih('Reset kata sandi tampil sebagai drawer samping (dialog) dan meminta sandi baru + "Ulangi kata sandi".');
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.008-reset-modal${suffix}.png`),
      fullPage: true,
    });

    // Langkah 2: isi sandi baru valid, klik Simpan kata sandi
    await modal.locator("#reset-password").fill(newPassword);
    await modal.locator("#reset-confirm").fill(newPassword);
    await modal.getByRole("button", { name: "Simpan kata sandi" }).click();
    await expect(modal).toBeHidden();
    await expect(
      page.getByRole("status").filter({ hasText: `Kata sandi ${name} diperbarui.` }),
    ).toBeVisible();
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.008-reset-pass${suffix}.png`),
      fullPage: true,
    });

    // Verifikasi sungguhan: sandi lama ditolak
    await submitDriverLogin(page, username, oldPassword);
    await expect(page.getByRole("alert").filter({ hasText: "Kata sandi belum tepat." })).toBeVisible();
    await expect(page).toHaveURL(/\/masuk\/driver/);

    // Verifikasi sungguhan: sandi baru diterima, masuk ke /driver
    await submitDriverLogin(page, username, newPassword);
    await expect(page).toHaveURL(/\/driver\/?$/, { timeout: 10000 });
  });
});
