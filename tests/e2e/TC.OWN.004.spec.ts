import { test, expect, type Page } from "@playwright/test";
import path from "path";

/**
 * PBI-OWN-01
 * Test Case ID: TC.OWN.004
 * Skenario: Positive
 * Deskripsi: Owner mencari dan memfilter daftar akun staf
 * Prekondisi: Owner sudah login dan berada di /admin/akun.
 *
 * Catatan: UI memakai dropdown "Filter peran" (Semua peran / Admin / Driver),
 * bukan filter chip. Tes memakai dropdown tersebut; selisihnya dicatat sebagai
 * anotasi "selisih".
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

test.describe("TC.OWN.004 - Pencarian dan filter akun", () => {
  test("Cari 'Rizky', filter Driver, lalu kembali ke Semua", async ({ page, isMobile }) => {
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
    const search = page.getByRole("textbox", { name: "Cari akun" });
    const roleFilter = page.getByRole("combobox", { name: "Filter peran" });
    await expect(rows).toHaveCount(6);

    // Langkah 1: ketik "Rizky" di kolom pencarian
    await search.fill("Rizky");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("@rizky");
    await expect(page.getByText("1 dari 6 akun")).toBeVisible();
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.004-search${suffix}.png`),
      fullPage: true,
    });

    // Langkah 2: filter peran Driver (kolom pencarian dikosongkan dulu supaya
    // hasil filter berdiri sendiri)
    await search.fill("");
    await expect(page.getByRole("button", { name: /^Driver$/ })).toHaveCount(0);
    selisih('Tidak ada filter chip "Driver"; filter peran berupa dropdown "Filter peran" (opsi "Driver").');
    await roleFilter.selectOption("driver");
    await expect(rows).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(rows.nth(i).locator("td").nth(1)).toHaveText("Driver");
    }
    await expect(page.getByText("4 dari 6 akun")).toBeVisible();
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.004-filter-driver${suffix}.png`),
      fullPage: true,
    });

    // Langkah 3: kembali ke "Semua"
    await expect(page.getByRole("button", { name: /^Semua$/ })).toHaveCount(0);
    selisih('Tidak ada filter chip "Semua"; opsi dropdown bernama "Semua peran".');
    await roleFilter.selectOption("all");
    await expect(rows).toHaveCount(6);
    await expect(rows.filter({ hasText: "@owner" })).toHaveCount(1);
    await expect(rows.filter({ hasText: "@admin" })).toHaveCount(1);
    await expect(rows.filter({ has: page.locator("td:nth-child(2)", { hasText: /^Driver$/ }) })).toHaveCount(4);
    await expect(page.getByText("6 dari 6 akun")).toBeVisible();
    await page.screenshot({
      path: path.join("test-results", `TC.OWN.004-filter-semua${suffix}.png`),
      fullPage: true,
    });
  });
});
