import { test, expect, type Page } from "@playwright/test";
import path from "path";

/**
 * PBI-OWN-01
 * Test Case ID: TC.OWN.010
 * Skenario: Positive
 * Deskripsi: Owner mengaktifkan kembali akun staf yang nonaktif
 * Prekondisi: Ada akun staf Nonaktif. Akun Driver uji dibuat lalu dinonaktifkan
 *             di dalam tes ini (akun seed tidak diubah).
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
  await drawer.locator("#account-phone").fill("0812-9000-0010");
  await drawer.locator("#account-password").fill(password);
  await drawer.getByRole("button", { name: /^Z1,/ }).click();
  await drawer.getByRole("button", { name: "Buat akun" }).click();
  await expect(drawer).toBeHidden();
}

test.describe("TC.OWN.010 - Aktifkan kembali akun staf", () => {
  test("Owner mengaktifkan kembali Driver nonaktif, status Aktif dan Driver bisa login", async ({
    page,
    isMobile,
  }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 1366, height: 860 });
    }
    const suffix = isMobile ? "-mobile" : "";
    const username = `drvuji${Date.now().toString(36)}`;
    const name = "Driver Uji 010";
    const password = "uji12345";

    // Prasyarat: buat Driver uji lalu nonaktifkan
    await loginOwner(page);
    await page.goto("/admin/akun");
    await expect(page.getByRole("heading", { name: /Manajemen akun/i })).toBeVisible({
      timeout: 10000,
    });
    await createTestDriver(page, name, username, password);
    const row = page.locator("table tbody tr").filter({ hasText: `@${username}` });
    const statusCell = row.locator("td").nth(4);
    await row.getByRole("button", { name: `Nonaktifkan akun ${name}` }).click();
    const deactivate = page.getByRole("dialog", { name: "Nonaktifkan akun" });
    await deactivate.getByRole("button", { name: "Nonaktifkan akun" }).click();
    await expect(deactivate).toBeHidden();
    await expect(statusCell).toHaveText("Nonaktif");

    // Langkah 1: klik aksi aktifkan (ikon Power) di baris akun nonaktif
    const activateButton = row.getByRole("button", { name: `Aktifkan akun ${name}` });
    await expect(activateButton).toHaveCount(1);
    selisih('Aksi bernama "Aktifkan akun" (ikon Power, tooltip "Aktifkan akun"), bukan tombol "Aktifkan Kembali".');
    await activateButton.click();

    // Verifikasi: dialog konfirmasi aktivasi muncul, akun belum diaktifkan
    const confirmDialog = page.getByRole("dialog", { name: "Aktifkan kembali akun" });
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog).toContainText(`(@${username}) akan diaktifkan kembali.`);
    await expect(confirmDialog.getByRole("button", { name: "Batal" })).toBeVisible();
    await expect(statusCell).toHaveText("Nonaktif");
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.010-reactivate-modal${suffix}.png`),
      fullPage: true,
    });

    // Langkah 2: klik "Aktifkan"
    await confirmDialog.getByRole("button", { name: "Aktifkan", exact: true }).click();
    await expect(confirmDialog).toBeHidden();

    // Verifikasi: status kembali "Aktif" dengan indikator hijau, toast muncul
    await expect(
      page.getByRole("status").filter({ hasText: `Akun ${name} diaktifkan kembali.` }),
    ).toBeVisible();
    await expect(statusCell).toHaveText("Aktif");
    await expect(statusCell.locator("span").first()).toHaveClass(/text-ink/);
    await expect(statusCell.locator("span.rounded-full")).toHaveClass(/bg-accent/);
    await expect(row.getByRole("button", { name: `Nonaktifkan akun ${name}` })).toHaveCount(1);
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.010-reactivated${suffix}.png`),
      fullPage: true,
    });

    // Verifikasi sungguhan: Driver bisa login lagi
    await page.goto("/masuk/driver");
    await expect(page.getByRole("heading", { name: /Masuk sebagai Driver/i })).toBeVisible({
      timeout: 10000,
    });
    await page.fill("#identifier", username);
    await page.fill("#password", password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/driver\/?$/, { timeout: 10000 });
  });
});
