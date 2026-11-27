import { spawn } from "node:child_process";
import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:3000";

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isServerReady() {
  try {
    const res = await fetch(`${BASE_URL}/public`);
    return res.status === 200 || res.status === 307;
  } catch {
    return false;
  }
}

async function run() {
  console.log("=== MEMULAI PENGUJIAN BLACKBOX TC.DRV.002 (FILTER CHIPS PENJEMPUTAN) ===");

  let serverProcess = null;
  if (!(await isServerReady())) {
    console.log("Menjalankan Next.js dev server...");
    serverProcess = spawn("npm.cmd", ["run", "dev"], {
      stdio: "pipe",
      shell: true,
    });

    let attempts = 0;
    while (attempts < 30) {
      await wait(1000);
      if (await isServerReady()) {
        console.log("Dev server siap di " + BASE_URL);
        break;
      }
      attempts++;
    }
  } else {
    console.log("Dev server sudah berjalan di " + BASE_URL);
  }

  console.log("Membuka browser Chromium/Edge headless...");
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 412, height: 915 });

    console.log("[Langkah 1] Membuka /masuk/driver dan login sebagai 'rizky'...");
    await page.goto(`${BASE_URL}/masuk/driver`, { waitUntil: "networkidle0" });
    await page.type("#identifier", "rizky");
    await page.type("#password", "driver123");
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: "networkidle0" });
    console.log("Berada di halaman:", page.url());

    // Cek awal sebelum filter
    const initialCards = await page.$$eval("article", (cards) => cards.length);
    console.log(`Jumlah kartu sebelum filter: ${initialCards}`);

    // Cari tombol filter chip 'Penjemputan'
    console.log("[Langkah 2] Mencari dan mengeklik tombol filter chip 'Penjemputan'...");
    const filterBtnClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const pickupBtn = buttons.find((b) => b.innerText.startsWith("Penjemputan"));
      if (pickupBtn) {
        pickupBtn.click();
        return true;
      }
      return false;
    });

    if (!filterBtnClicked) {
      throw new Error("Tombol filter chip 'Penjemputan' tidak ditemukan.");
    }

    await wait(500); // beri waktu render state

    console.log("\n--- VERIFIKASI EKSPEKTASI TEST CASE TC.DRV.002 ---");

    // Verifikasi 1: Apakah bagian Pengantaran tersembunyi
    const hasDeliveryHeading = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll("h2"));
      return headings.some((h) => h.innerText.includes("Pengantaran"));
    });
    console.log(`1. Bagian Pengantaran Tampil: ${hasDeliveryHeading ? "Ya" : "Tidak"}`);
    if (hasDeliveryHeading) {
      throw new Error("Bagian Pengantaran masih tampil padahal filter Penjemputan aktif.");
    }
    console.log("   -> [PASS] Bagian Pengantaran berhasil disembunyikan.");

    // Verifikasi 2: Apakah kartu yang tampil hanya berstatus Menunggu Penjemputan
    const filteredCards = await page.evaluate(() => {
      const articles = Array.from(document.querySelectorAll("article"));
      return articles.map((card) => {
        const text = card.innerText;
        const code = card.querySelector("span.font-mono")?.innerText.trim();
        const hasMenunggu = text.includes("Menunggu Penjemputan");
        const hasSiap = text.includes("Siap Diantar");
        const hasActionJemput = text.includes("Selesaikan Penjemputan");
        return { code, hasMenunggu, hasSiap, hasActionJemput };
      });
    });

    console.log(`2. Jumlah Kartu Tugas Pasca Filter: ${filteredCards.length}`);
    if (filteredCards.length === 0) {
      throw new Error("Tidak ada kartu tugas yang ditampilkan setelah filter.");
    }

    let allOnlyPickup = true;
    for (const card of filteredCards) {
      console.log(`   - Kartu ${card.code}: Status Menunggu = ${card.hasMenunggu}, Siap = ${card.hasSiap}, Aksi = ${card.hasActionJemput ? "Selesaikan Penjemputan" : "Lainnya"}`);
      if (!card.hasMenunggu || card.hasSiap || !card.hasActionJemput) {
        allOnlyPickup = false;
      }
    }

    if (!allOnlyPickup) {
      throw new Error("Ditemukan kartu yang bukan berstatus 'Menunggu Penjemputan'.");
    }
    console.log("   -> [PASS] 100% kartu yang tampil hanya berstatus 'Menunggu Penjemputan'.");

    console.log("\n=======================================================");
    console.log("HASIL AKHIR BLACKBOX TESTING: ALL ASSERTIONS PASSED (100%)");
    console.log("STATUS TEST CASE TC.DRV.002: PASS");
    console.log("=======================================================");
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

run().catch((err) => {
  console.error("\nTEST GAGAL DENGAN ERROR:", err.message);
  process.exit(1);
});
