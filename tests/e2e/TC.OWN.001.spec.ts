import { test, expect } from "@playwright/test";
import path from "path";

/**
 * PBI-OWN-01
 * Test Case ID: TC.OWN.001
 * Skenario: Positive
 * Deskripsi: Owner dapat login dan mengakses menu eksklusif Manajemen Akun
 * Prekondisi: Pengguna memiliki kredensial Owner (owner / owner123) dan berada
 *             di halaman /masuk/owner.
 */

test.describe("TC.OWN.001 - Autentikasi dan verifikasi hak akses Owner", () => {
  test("Memverifikasi login Owner, redirect ke /admin, profil nama, dan menu Manajemen Akun", async ({
    page,
    isMobile,
  }) => {
    // Proyek desktop memakai viewport desktop (>= 1024px) supaya sidebar tampil.
    // Proyek mobile memakai viewport perangkatnya sendiri.
    if (!isMobile) {
      await page.setViewportSize({ width: 1366, height: 860 });
    }
    // Screenshot mobile diberi akhiran supaya tidak menimpa screenshot desktop.
    const suffix = isMobile ? "-mobile" : "";

    // 1. Buka halaman login Owner
    await page.goto("/masuk/owner");
    await expect(page.getByRole("heading", { name: /Masuk sebagai Owner/i })).toBeVisible({
      timeout: 10000,
    });

    // 2. Isi kredensial Owner
    await page.fill("#identifier", "owner");
    await page.fill("#password", "owner123");

    // 3. Klik tombol Masuk
    await page.click('button[type="submit"]');

    // 4. Verifikasi: redirect ke /admin
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });

    // 5. Verifikasi: dashboard render penuh
    await expect(
      page.getByRole("heading", { name: /Dashboard/i })
    ).toBeVisible({ timeout: 10000 });

    // 6. Verifikasi: nama profil Owner tampil di halaman.
    //    UserMenu ada dua di <main> (header halaman untuk desktop, lg:hidden untuk
    //    layar kecil); ambil yang terlihat. adminDisplayName = "Admin " + user.name
    const userMenu = page.locator("main details").filter({ visible: true }).first();
    const userMenuSummary = userMenu.locator("summary");
    await expect(userMenuSummary).toBeVisible({ timeout: 5000 });
    await expect(userMenuSummary).toContainText(/Admin/i);
    await expect(userMenuSummary).toContainText(/Owner/i);

    // 7. Verifikasi: menu navigasi "Manajemen akun" muncul (ownerOnly)
    //    Desktop: link di sidebar. Layar kecil: sidebar tersembunyi, link ada
    //    di dropdown user menu, jadi buka dulu menunya.
    const sidebarLink = page.locator("aside").getByRole("link", { name: /Manajemen akun/i });
    if (await sidebarLink.isVisible()) {
      await expect(sidebarLink).toBeVisible();
    } else {
      await userMenuSummary.click();
      await expect(
        userMenu.getByRole("link", { name: /Manajemen akun/i })
      ).toBeVisible({ timeout: 5000 });
      // Tutup lagi menu sebelum screenshot
      await userMenuSummary.click();
      await expect(userMenu).not.toHaveAttribute("open", /.*/);
    }

    // 8. Screenshot sebagai bukti (TC.OWN.001-login.png)
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.001-login${suffix}.png`),
      fullPage: true,
    });

    // 9. Langkah 2: navigasi ke halaman Manajemen Akun
    await page.goto("/admin/akun");
    await expect(page).toHaveURL(/\/admin\/akun/, { timeout: 10000 });

    // 10. Verifikasi: heading "Manajemen akun" tampil
    await expect(
      page.getByRole("heading", { name: /Manajemen akun/i })
    ).toBeVisible({ timeout: 10000 });

    // 11. Verifikasi: banner identitas Owner tampil
    await expect(
      page.getByText(/Owner adalah tingkat akses tertinggi/i)
    ).toBeVisible({ timeout: 5000 });

    // 12. Verifikasi: baris akun @owner punya lencana "Owner" dengan ikon ShieldCheck
    //     (daftar akun berupa <table> di semua ukuran layar)
    const ownerRow = page.locator("tr", { hasText: "@owner" });
    const ownerBadge = ownerRow.locator("span", { hasText: /^Owner$/ });
    await ownerBadge.scrollIntoViewIfNeeded();
    await expect(ownerBadge).toBeVisible({ timeout: 5000 });
    await expect(ownerBadge.locator("svg.lucide-shield-check")).toBeVisible();

    // 13. Screenshot sebagai bukti (TC.OWN.001-akses-akun.png)
    //     Gulir ke atas dulu supaya header sticky tidak menimpa konten di screenshot.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.001-akses-akun${suffix}.png`),
      fullPage: true,
    });
  });
});
