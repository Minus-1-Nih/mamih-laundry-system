import { test, expect } from "@playwright/test";

/**
 * PBI-DRV-02: Filter & Manajemen Tugas Kurir
 * Test Case ID: TC.DRV.002
 * Skenario: Positive
 * Deskripsi: Sistem menyaring daftar kartu tugas berdasarkan kategori yang dipilih kurir
 * Prekondisi: Kurir berada di halaman /driver dan memiliki tugas aktif kategori Penjemputan serta Pengantaran.
 */

test.describe("TC.DRV.002 - Penyaringan daftar tugas menggunakan filter chips", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Masuk ke halaman login driver
    await page.goto("/masuk/driver");

    // 2. Isi kredensial driver demo (Rizky - memiliki tugas Penjemputan & Pengantaran di Zona Z1)
    await page.fill("#identifier", "rizky");
    await page.fill("#password", "driver123");
    await page.click('button[type="submit"]');

    // 3. Pastikan sudah berada di halaman /driver
    await expect(page).toHaveURL(/\/driver/);

    // 4. Pastikan data awal memuat kedua jenis tugas aktif
    await expect(page.getByText("Tugas Penjemputan", { exact: true })).toBeVisible();
    await expect(page.getByText("Tugas Pengantaran", { exact: true })).toBeVisible();
  });

  test("Menyaring daftar tugas hanya menampilkan kategori Penjemputan saat filter chip Penjemputan diklik", async ({
    page,
  }) => {
    // --- Pre-verifikasi: Pastikan sebelum difilter, kartu tugas pengantaran ada di layar ---
    const deliveryHeadingBefore = page.getByRole("heading", {
      name: "Pengantaran",
      level: 2,
    });
    await expect(deliveryHeadingBefore).toBeVisible();

    // --- Langkah 1: Klik tombol filter chip 'Penjemputan' ---
    const pickupFilterChip = page.getByRole("button", {
      name: /^Penjemputan \(/,
    });
    await expect(pickupFilterChip).toBeVisible();
    await pickupFilterChip.click();

    // --- Verifikasi Visual State Filter Chip ---
    // Filter chip Penjemputan aktif (memiliki warna latar Sage Green #2A6F56 dan teks putih)
    await expect(pickupFilterChip).toHaveClass(/bg-\[#2A6F56\]/);
    await expect(pickupFilterChip).toHaveClass(/text-white/);

    // --- Verifikasi Ekspektasi Hasil 1: Bagian Pengantaran tidak lagi ditampilkan ---
    await expect(deliveryHeadingBefore).not.toBeVisible();

    // --- Verifikasi Ekspektasi Hasil 2: Bagian Penjemputan tetap ditampilkan ---
    const pickupHeading = page.getByRole("heading", {
      name: "Penjemputan",
      level: 2,
    });
    await expect(pickupHeading).toBeVisible();

    // --- Verifikasi Ekspektasi Hasil 3: Seluruh kartu yang tampil hanya berstatus 'Menunggu Penjemputan' ---
    const visibleCards = page.locator("article");
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const card = visibleCards.nth(i);
      // Status harus "Menunggu Penjemputan"
      await expect(card.getByText("Menunggu Penjemputan")).toBeVisible();

      // Tidak boleh ada status "Siap Diantar"
      await expect(card.getByText("Siap Diantar")).not.toBeVisible();

      // Tombol aksi harus "Selesaikan Penjemputan"
      await expect(
        card.getByRole("button", { name: "Selesaikan Penjemputan" }),
      ).toBeVisible();
    }
  });
});
