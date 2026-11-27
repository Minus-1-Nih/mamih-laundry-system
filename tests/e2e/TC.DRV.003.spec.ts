import { test, expect } from "@playwright/test";

/**
 * PBI-DRV-03: Eksekusi Tugas & Pembaruan Status 1-Klik
 * Test Case ID: TC.DRV.003
 * Skenario: Positive
 * Deskripsi: Kurir berhasil memperbarui status tugas menjadi selesai saat koneksi daring (online)
 * Prekondisi: Kurir berada di halaman /driver dalam kondisi internet aktif dan terdapat tugas berstatus Menunggu Penjemputan.
 */

test.describe("TC.DRV.003 - Pembaruan status penyelesaian tugas penjemputan (1-Klik)", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Masuk ke halaman login driver
    await page.goto("/masuk/driver");

    // 2. Isi kredensial driver demo (Rizky - Zona Z1)
    await page.fill("#identifier", "rizky");
    await page.fill("#password", "driver123");
    await page.click('button[type="submit"]');

    // 3. Pastikan sudah berada di halaman /driver dan halaman sudah hydrated
    await expect(page).toHaveURL(/\/driver/);
    // Tunggu heading driver muncul sebagai sinyal halaman sudah render penuh
    await expect(page.getByRole("heading", { name: /Halo,/i })).toBeVisible({ timeout: 10000 });

    // 4. Verifikasi indikator status online (span dot, bukan button — lebih stabil)
    await expect(page.locator("span[title='Status: Online']")).toBeVisible({ timeout: 10000 });
  });

  test("Menyelesaikan penjemputan melalui modal konfirmasi 1-klik, memindahkan kartu ke tab riwayat, dan memunculkan notifikasi", async ({
    page,
  }) => {
    // Temukan kartu tugas penjemputan pertama
    const firstPickupCard = page
      .locator("article")
      .filter({ hasText: "Menunggu Penjemputan" })
      .first();
    await expect(firstPickupCard).toBeVisible({ timeout: 10000 });

    // Catat kode pesanan dan nama pelanggan kartu yang akan diselesaikan
    const targetOrderCode = await firstPickupCard
      .locator("span.font-mono")
      .innerText();
    const targetCustomerName = await firstPickupCard.locator("h3").innerText();

    // --- Langkah 1: Klik tombol aksi Selesaikan Penjemputan ---
    const actionButton = firstPickupCard.getByRole("button", {
      name: "Selesaikan Penjemputan",
    });
    await expect(actionButton).toBeVisible();
    await actionButton.click();

    // --- Verifikasi Ekspektasi Langkah 1: Modal konfirmasi 1-klik muncul ---
    const confirmModalHeading = page.getByRole("heading", {
      name: "Konfirmasi Penjemputan",
    });
    await expect(confirmModalHeading).toBeVisible();

    // Memverifikasi modal menampilkan kode pesanan dan nama pelanggan yang tepat
    const modal = page.getByRole('dialog', { name: 'Konfirmasi Penjemputan' });
    await expect(modal.getByText(targetOrderCode)).toBeVisible();
    await expect(modal.getByText(targetCustomerName)).toBeVisible();

    // --- Langkah 2: Klik tombol 'Ya, Selesaikan Penjemputan' pada modal konfirmasi ---
    const confirmSubmitBtn = page.getByRole("button", {
      name: "Ya, Selesaikan Penjemputan",
    });
    await expect(confirmSubmitBtn).toBeVisible();
    await confirmSubmitBtn.click();

    // --- Verifikasi Ekspektasi Langkah 2 ---
    // a. Modal konfirmasi tertutup
    await expect(confirmModalHeading).not.toBeVisible();

    // b. Muncul notifikasi toast berhasil
    const successToast = page.getByText("Status pesanan berhasil diperbarui.");
    await expect(successToast).toBeVisible();

    // c. Kartu berpindah dari daftar tugas aktif (tidak lagi ada di tab aktif)
    const cardInActive = page
      .locator("article")
      .filter({ hasText: targetOrderCode });
    await expect(cardInActive).not.toBeVisible();

    // d. Kartu kini tercatat di tab 'Riwayat Tugas Selesai'
    const historyTab = page.getByRole("button", {
      name: /Riwayat Tugas Selesai/i,
    });
    await historyTab.click();

    // Verifikasi kartu tugas dengan kode tersebut sekarang berada di riwayat selesai
    const cardInHistory = page
      .locator("article")
      .filter({ hasText: targetOrderCode });
    await expect(cardInHistory).toBeVisible();
    await expect(cardInHistory.getByText(/Jemput Selesai/i)).toBeVisible();
  });
});
