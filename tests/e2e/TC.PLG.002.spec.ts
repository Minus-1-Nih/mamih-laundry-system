import { test, expect } from "@playwright/test";

/**
 * EIM-02: Autentikasi Pelanggan (Daftar & Masuk)
 * Test Case ID: TC.PLG.002
 * Skenario: Negative
 * Deskripsi: Pendaftaran ditolak bila kata sandi tidak memenuhi aturan (huruf, angka, dan simbol)
 * Prekondisi: Pengguna berada di halaman /daftar
 */

test.describe("TC.PLG.002 - Validasi kata sandi saat pendaftaran", () => {
  test("Menampilkan pesan galat dan tetap di halaman daftar bila kata sandi tanpa simbol", async ({ page }) => {
    await page.goto("/daftar");

    await page.fill("#name", "Budi Santoso");
    await page.fill("#email", "budi.santoso@gmail.com");
    await page.fill("#phone", "0812-3456-7890");
    await page.fill("#password", "rahasia1");
    await page.fill("#confirm", "rahasia1");
    await page.getByRole("button", { name: "Daftar", exact: true }).click();

    // Sistem menolak dan menampilkan alasan penolakan
    await expect(page.getByRole("alert").filter({ hasText: "huruf, angka, dan simbol" })).toBeVisible();
    await expect(page).toHaveURL(/\/daftar/);
  });
});