import { test, expect, type Page } from "@playwright/test";
import path from "path";

/**
 * PBI-OWN-01
 * Test Case ID: TC.OWN.006
 * Skenario: Negative
 * Deskripsi: Sistem menolak pembuatan akun dengan username yang sudah dipakai
 * Prekondisi: Owner sudah login dan form Tambah akun terbuka.
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

test.describe("TC.OWN.006 - Username duplikat ditolak", () => {
  test("Form Tambah akun dengan username 'rizky' menampilkan error dan tidak menyimpan", async ({
    page,
    isMobile,
  }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 1366, height: 860 });
    }
    const suffix = isMobile ? "-mobile" : "";

    await loginOwner(page);
    await page.goto("/admin/akun");
    await expect(page.getByRole("heading", { name: /Manajemen akun/i })).toBeVisible({
      timeout: 10000,
    });
    const rows = page.locator("table tbody tr");
    await expect(rows).toHaveCount(6);

    // Buka form Tambah akun dan isi data valid dengan username yang sudah ada
    await page.getByRole("button", { name: /Tambah akun/i }).click();
    const drawer = page.getByRole("dialog", { name: "Tambah akun" });
    await expect(drawer).toBeVisible();
    await drawer.getByRole("button", { name: "Driver", exact: true }).click();
    await drawer.locator("#account-name").fill("Rizky Duplikat");
    await drawer.locator("#account-username").fill("rizky");
    await drawer.locator("#account-phone").fill("0812-9000-0006");
    await drawer.locator("#account-password").fill("uji12345");
    await drawer.getByRole("button", { name: /^Z1,/ }).click();
    await drawer.getByRole("button", { name: "Buat akun" }).click();

    // Verifikasi: pesan error tampil, drawer tetap terbuka
    const error = drawer.getByRole("alert");
    await expect(error).toBeVisible();
    await expect(error).toHaveText("Username sudah dipakai.");
    selisih('Pesan error "Username sudah dipakai.", bukan "Username sudah digunakan".');
    await expect(drawer).toBeVisible();
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.006-duplicate-user${suffix}.png`),
      fullPage: true,
    });

    // Verifikasi: simpan dibatalkan, tabel tetap 6 akun dan hanya satu @rizky
    await drawer.getByRole("button", { name: "Batal" }).click();
    await expect(drawer).toBeHidden();
    await expect(rows).toHaveCount(6);
    await expect(rows.filter({ hasText: "@rizky" })).toHaveCount(1);
    await expect(page.getByText("Rizky Duplikat")).toHaveCount(0);
  });
});
