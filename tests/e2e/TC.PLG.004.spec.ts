import { test, expect } from "@playwright/test";

/**
 * EIM-02: Autentikasi Pelanggan (Daftar & Masuk)
 * Test Case ID: TC.PLG.004
 * Skenario: Negative
 * Deskripsi: Kata sandi salah ditolak, dan halaman akun tidak dapat dibuka tanpa masuk
 * Prekondisi: Pengguna belum masuk akun
 */

test.describe("TC.PLG.004 - Penolakan akses pelanggan tidak sah", () => {
  test("Menolak kata sandi yang salah", async ({ page }) => {
    await page.goto("/masuk");
    await page.fill("#identifier", "adinda");
    await page.fill("#password", "salah123");
    await page.click('button[type="submit"]');

    await expect(page.getByRole("alert").filter({ hasText: "Kata sandi belum tepat" })).toBeVisible();
    await expect(page).toHaveURL(/\/masuk/);
  });

  test("Mengarahkan ke halaman masuk saat membuka riwayat tanpa login", async ({ page }) => {
    await page.goto("/akun/riwayat");
    await expect(page).toHaveURL(/\/masuk/);
  });
});