import { test, expect, type Page } from "@playwright/test";
import path from "path";

/**
 * PBI-OWN-01
 * Test Case ID: TC.OWN.009
 * Skenario: Positive
 * Deskripsi: Owner menonaktifkan akun karyawan, akun tidak bisa login lagi
 * Prekondisi: Owner sudah login di /admin/akun. Akun Driver uji aktif dibuat
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
  await drawer.locator("#account-phone").fill("0812-9000-0009");
  await drawer.locator("#account-password").fill(password);
  await drawer.getByRole("button", { name: /^Z1,/ }).click();
  await drawer.getByRole("button", { name: "Buat akun" }).click();
  await expect(drawer).toBeHidden();
}

test.describe("TC.OWN.009 - Nonaktifkan akun karyawan", () => {
  test("Owner menonaktifkan Driver lewat ikon Power, status jadi Nonaktif dan login ditolak", async ({
    page,
    isMobile,
  }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 1366, height: 860 });
    }
    const suffix = isMobile ? "-mobile" : "";
    const username = `drvuji${Date.now().toString(36)}`;
    const name = "Driver Uji 009";
    const password = "uji12345";

    await loginOwner(page);
    await page.goto("/admin/akun");
    await expect(page.getByRole("heading", { name: /Manajemen akun/i })).toBeVisible({
      timeout: 10000,
    });
    await createTestDriver(page, name, username, password);
    const row = page.locator("table tbody tr").filter({ hasText: `@${username}` });
    const statusCell = row.locator("td").nth(4);
    await expect(statusCell).toHaveText("Aktif");

    // Langkah 1: klik ikon Power (Nonaktifkan) -> konfirmasi penonaktifan
    const powerButton = row.getByRole("button", { name: `Nonaktifkan akun ${name}` });
    await expect(powerButton.locator("svg.lucide-power")).toHaveCount(1);
    await powerButton.click();
    const modal = page.getByRole("dialog", { name: "Nonaktifkan akun" });
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(`(@${username}) akan dinonaktifkan.`);
    selisih("Konfirmasi tampil sebagai drawer samping (dialog), bukan modal di tengah.");
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.009-deactivate-modal${suffix}.png`),
      fullPage: true,
    });

    // Langkah 2: klik "Nonaktifkan akun"
    await modal.getByRole("button", { name: "Nonaktifkan akun" }).click();
    selisih('Tombol konfirmasi bernama "Nonaktifkan akun", bukan "Nonaktifkan".');
    await expect(modal).toBeHidden();
    await expect(
      page.getByRole("status").filter({ hasText: `Akun ${name} dinonaktifkan.` }),
    ).toBeVisible();

    // Verifikasi: status "Nonaktif" dengan indikator abu-abu
    await expect(statusCell).toHaveText("Nonaktif");
    await expect(statusCell.locator("span").first()).toHaveClass(/text-muted/);
    await expect(statusCell.locator("span.rounded-full")).toHaveClass(/bg-rule/);
    await expect(row.getByRole("button", { name: `Aktifkan akun ${name}` })).toHaveCount(1);
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.009-deactivated${suffix}.png`),
      fullPage: true,
    });

    // Verifikasi sungguhan: akun nonaktif ditolak saat login
    await page.goto("/masuk/driver");
    await expect(page.getByRole("heading", { name: /Masuk sebagai Driver/i })).toBeVisible({
      timeout: 10000,
    });
    await page.fill("#identifier", username);
    await page.fill("#password", password);
    await page.click('button[type="submit"]');
    await expect(
      page.getByRole("alert").filter({ hasText: "Akun ini sedang nonaktif. Hubungi Owner." }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/masuk\/driver/);
  });
});
