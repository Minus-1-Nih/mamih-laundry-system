import { test, expect } from "@playwright/test";
import path from "path";

/**
 * PBI-OWN-01
 * Test Case ID: TC.OWN.002
 * Skenario: Negative
 * Deskripsi: Admin biasa (bukan Owner) ditolak saat membuka halaman Manajemen Akun
 * Prekondisi: Pengguna memiliki kredensial Admin (admin / admin123).
 */

test.describe("TC.OWN.002 - Penolakan akses Manajemen Akun untuk Admin non-Owner", () => {
  test("Admin login lalu membuka /admin/akun langsung, sistem mengarahkan kembali ke /admin", async ({
    page,
    isMobile,
  }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 1366, height: 860 });
    }
    const suffix = isMobile ? "-mobile" : "";

    // 1. Login sebagai Admin
    await page.goto("/masuk/admin");
    await expect(page.getByRole("heading", { name: /Masuk sebagai Admin/i })).toBeVisible({
      timeout: 10000,
    });
    await page.fill("#identifier", "admin");
    await page.fill("#password", "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 10000 });
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible({
      timeout: 10000,
    });

    // 2. Akses langsung URL /admin/akun
    await page.goto("/admin/akun");

    // 3. Verifikasi: RoleGuard mengarahkan kembali ke /admin (dashboard)
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 10000 });
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible({
      timeout: 10000,
    });

    // 4. Verifikasi: konten Manajemen Akun tidak pernah tampil
    await expect(page.getByRole("heading", { name: /Manajemen akun/i })).toHaveCount(0);
    await expect(page.getByText(/Owner adalah tingkat akses tertinggi/i)).toHaveCount(0);

    // 5. Verifikasi: menu "Manajemen akun" tidak muncul untuk Admin
    await expect(
      page.locator("aside").getByRole("link", { name: /Manajemen akun/i })
    ).toHaveCount(0);

    // 6. Screenshot sebagai bukti (TC.OWN.002-guard-reject.png)
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.002-guard-reject${suffix}.png`),
      fullPage: true,
    });
  });
});
