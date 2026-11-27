import { test, expect } from "@playwright/test";

/**
 * PBI-DRV-06: Riwayat Tugas
 * Test Case ID: TC.DRV.007
 * Skenario: Positive
 * Deskripsi: Kurir dapat melihat daftar tugas yang telah diselesaikan hari ini
 *            beserta detail rinciannya.
 * Prekondisi: Kurir memiliki minimal satu tugas yang telah diselesaikan pada hari berjalan.
 */

test.describe("TC.DRV.007 - Tampilan rekapitulasi riwayat tugas selesai dan rincian pesanan", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/masuk/driver");
    await page.fill("#identifier", "rizky");
    await page.fill("#password", "driver123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/driver/);
    await expect(page.getByRole("heading", { name: /Halo,/i })).toBeVisible({ timeout: 10000 });
  });

  test("Langkah 1 & 2: Tab riwayat menampilkan ringkasan dan modal rincian read-only dapat dibuka", async ({
    page,
  }) => {
    // === SETUP: Selesaikan satu tugas penjemputan supaya ada riwayat ===
    const firstPickupCard = page
      .locator("article")
      .filter({ hasText: "Menunggu Penjemputan" })
      .first();
    await expect(firstPickupCard).toBeVisible({ timeout: 10000 });

    // Catat nama pelanggan untuk verifikasi di modal
    const customerName = await firstPickupCard.locator("h3").innerText();

    // Selesaikan tugas
    await firstPickupCard.getByRole("button", { name: "Selesaikan Penjemputan" }).click();
    await expect(page.getByRole("dialog", { name: "Konfirmasi Penjemputan" })).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "Ya, Selesaikan Penjemputan" }).click();

    // Tunggu toast berhasil
    await expect(page.getByText("Status pesanan berhasil diperbarui.")).toBeVisible({ timeout: 5000 });

    // === Langkah 1: Klik tab Riwayat Tugas Selesai ===
    const historyTab = page.getByRole("button", { name: /Riwayat Tugas Selesai/i });
    await historyTab.click();

    // Verifikasi 1a: Ringkasan total pencapaian harian muncul
    await expect(page.getByText("Total Tugas Selesai")).toBeVisible({ timeout: 5000 });

    // Verifikasi 1b: Minimal ada satu kartu riwayat dengan status selesai
    const historyCard = page
      .locator("article")
      .filter({ hasText: customerName })
      .first();
    await expect(historyCard).toBeVisible({ timeout: 5000 });

    // Verifikasi 1c: Kartu menampilkan waktu penyelesaian
    await expect(
      historyCard.getByText(/Jemput Selesai:|Antar Selesai:/i)
    ).toBeVisible();

    // === Langkah 2: Klik tombol Lihat rincian pesanan ===
    await historyCard.getByRole("button", { name: /Lihat rincian pesanan/i }).click();

    // Verifikasi 2: Modal rincian read-only muncul
    const detailModal = page.getByRole("dialog", { name: /Rincian Pesanan/i });
    await expect(detailModal).toBeVisible({ timeout: 5000 });

    // Verifikasi isi modal: nama pelanggan
    await expect(detailModal.getByText(customerName)).toBeVisible();

    // Verifikasi isi modal: label-label detail
    await expect(detailModal.getByText("Nama pelanggan")).toBeVisible();
    await expect(detailModal.getByText("Jenis layanan & berat")).toBeVisible();
    await expect(detailModal.getByText("Alamat lengkap & patokan")).toBeVisible();

    // Verifikasi isi modal: catatan waktu penyelesaian (Riwayat Penyelesaian)
    await expect(detailModal.getByText("Riwayat Penyelesaian")).toBeVisible();

    // Tutup modal — gunakan .last() karena ada 2 tombol Tutup (X icon + footer)
    await detailModal.getByRole("button", { name: "Tutup" }).last().click();
    await expect(detailModal).not.toBeVisible({ timeout: 5000 });
  });
});
