import { test, expect } from "@playwright/test";

/**
 * EIM-03: Pelacakan Publik Status Pesanan
 * Test Case ID: TC.PLG.005
 * Skenario: Positive
 * Deskripsi: Pelanggan dapat memantau status pesanan dengan Kode Unik Z1-YYMMDD-NNN tanpa login
 * Prekondisi: Pengguna belum masuk akun; pesanan Z1-261104-012 tersedia
 */

test.describe("TC.PLG.005 - Pelacakan pesanan dengan kode unik valid", () => {
  test("Memasukkan kode unik lalu melihat status pesanan", async ({ page }) => {
    await page.goto("/tracking");

    await page.getByPlaceholder("Z1-261104-012").first().fill("Z1-261104-012");
    await page.getByRole("button", { name: "Lacak pesanan" }).first().click();

    await expect(page).toHaveURL(/kode=Z1-261104-012/);
    await expect(page.getByText("Z1-261104-012").first()).toBeVisible();
  });
});