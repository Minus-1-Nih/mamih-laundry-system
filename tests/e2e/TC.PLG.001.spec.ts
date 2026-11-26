import { test, expect } from "@playwright/test";

/**
 * EIM-02: Autentikasi Pelanggan (Daftar & Masuk)
 * Test Case ID: TC.PLG.001
 * Skenario: Positive
 * Deskripsi: Pelanggan baru dapat mendaftar akun dan langsung diarahkan ke halaman riwayat pesanan
 * Prekondisi: Pengguna belum masuk akun dan berada di halaman /daftar
 */

test.describe("TC.PLG.001 - Pendaftaran akun pelanggan baru", () => {
  test("Mengisi formulir pendaftaran dengan data valid lalu masuk ke riwayat pesanan", async ({ page }) => {
    // --- Step 1: Buka halaman pendaftaran ---
    await page.goto("/daftar");

    // --- Step 2: Isi data diri yang valid ---
    await page.fill("#name", "Budi Santoso");
    await page.fill("#email", "budi.santoso@gmail.com");
    await page.fill("#phone", "0812-3456-7890");
    await page.fill("#password", "rahasia1!");
    await page.fill("#confirm", "rahasia1!");

    // --- Step 3: Kirim formulir ---
    await page.getByRole("button", { name: "Daftar", exact: true }).click();

    // --- Step 4: Pastikan akun dibuat dan diarahkan ke /akun/riwayat ---
    await expect(page).toHaveURL(/\/akun\/riwayat/);
    await expect(page.getByRole("heading", { name: "Riwayat Pesanan" })).toBeVisible();
  });
});