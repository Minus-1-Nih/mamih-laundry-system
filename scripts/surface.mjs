#!/usr/bin/env node
// scripts/surface.mjs — prove that every surface in docs/features.md still
// renders, by reading the map and asserting each row's proof string in a real
// browser.
//
// Requires: a running dev server, and a Chrome binary. It seeds the session
// directly into localStorage; it does not exercise the login form.

import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, relative } from "node:path";
import puppeteer from "puppeteer-core";

const ROOT = process.cwd();
const MAP = join(ROOT, "docs/features.md");
const STORE = "laundria-demo-v1";
const SHOTS = "/tmp/laundria-surfaces";

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const value = (name, fallback) => {
  const i = argv.indexOf(name);
  return i === -1 ? fallback : argv[i + 1] ?? fallback;
};

if (flag("--help") || flag("-h")) {
  console.log(`Usage: node scripts/surface.mjs [--all | --only <route>] [options]

Reads the Surfaces table in docs/features.md and, for each row, seeds the
session for the role implied by its Guard column, navigates to the route, and
waits for the row's proof string to appear.

Requires a running dev server:
  npm run dev            # in another terminal
  node scripts/surface.mjs

Options:
  --all            every row in the map (default)
  --only <route>   one route, e.g. --only /admin/pesanan
  --base <url>     dev server origin (default http://localhost:3000)
  --screenshots    capture every surface, not just failures
  --json           machine-readable output
  --timeout <ms>   per-surface wait (default 10000)

Exit code is 0 only when every selected surface rendered its proof.
`);
  process.exit(0);
}

const base = value("--base", "http://localhost:3000").replace(/\/$/, "");
const only = value("--only", null);
const timeout = Number(value("--timeout", "10000"));
const allShots = flag("--screenshots");
const asJson = flag("--json");

// --- chrome -----------------------------------------------------------------
function findChrome() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;

  const cache = join(homedir(), ".cache", "puppeteer", "chrome");
  if (existsSync(cache)) {
    for (const dir of readdirSync(cache).sort().reverse()) {
      const bin = join(cache, dir, "chrome-linux64", "chrome");
      if (existsSync(bin)) return bin;
    }
  }

  for (const bin of [
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
  ]) {
    if (existsSync(bin)) return bin;
  }
  return null;
}

// --- map --------------------------------------------------------------------
function readSurfaces() {
  if (!existsSync(MAP)) {
    throw new Error(`${relative(ROOT, MAP)} not found. The map is the input.`);
  }
  const lines = readFileSync(MAP, "utf8").split("\n");
  const header = lines.findIndex((l) => /^\|\s*Surface\s*\|/.test(l));
  if (header === -1) {
    throw new Error("No '| Surface | Route | ...' table in docs/features.md.");
  }

  const rows = [];
  for (let i = header + 2; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line.startsWith("|")) break;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 5) continue;
    const [surface, route, guard, urlState, proof] = cells;
    const path = route.replace(/`/g, "").trim();
    if (!path.startsWith("/")) continue;
    const proofs = [...proof.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    rows.push({ surface, path, guard, urlState, proofs });
  }
  return rows;
}

const roleFor = (guard) => {
  if (guard.includes("/admin")) return "owner";
  if (guard.includes("/driver")) return "rizky";
  if (guard.includes("/akun")) return "adinda";
  return null;
};

const squash = (s) => s.replace(/\s+/g, " ").trim();

async function waitForProof(page, text, ms) {
  const needle = squash(text);
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    const body = squash(await page.evaluate(() => document.body?.innerText ?? ""));
    if (body.includes(needle)) return true;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return false;
}

async function waitForServer(page) {
  try {
    await page.goto(base, { waitUntil: "domcontentloaded", timeout: 8000 });
  } catch {
    console.error(`No server at ${base}.`);
    console.error("Start it first:  npm run dev");
    console.error("Then re-run:     node scripts/surface.mjs");
    process.exit(2);
  }
}

async function seed(page, username) {
  return page.evaluate(
    ({ key, user }) => {
      const raw = window.localStorage.getItem(key);
      if (!raw) return { ok: false, reason: "store not initialised" };
      const parsed = JSON.parse(raw);
      const state = parsed.state ?? parsed;
      if (!Array.isArray(state.users)) return { ok: false, reason: "no users in store" };
      const match = user ? state.users.find((u) => u.username === user) : null;
      if (user && !match) {
        return { ok: false, reason: `no seed user "${user}"`, users: state.users.map((u) => u.username) };
      }
      state.currentUserId = match ? match.id : null;
      if (parsed.state) parsed.state = state;
      window.localStorage.setItem(key, JSON.stringify(parsed));
      return { ok: true };
    },
    { key: STORE, user: username },
  );
}

// --- run --------------------------------------------------------------------
const chrome = findChrome();
if (!chrome) {
  console.error("No Chrome binary found.");
  console.error("Install one:  npx puppeteer browsers install chrome");
  console.error("Or point at it: PUPPETEER_EXECUTABLE_PATH=/path/to/chrome node scripts/surface.mjs");
  process.exit(2);
}

const surfaces = readSurfaces().filter((row) => (only ? row.path === only : true));
if (surfaces.length === 0) {
  console.error(only ? `No row in docs/features.md for ${only}.` : "No surfaces to check.");
  process.exit(2);
}

mkdirSync(SHOTS, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const results = [];
try {
  await waitForServer(page);
  await page.goto(`${base}/public`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    (key) => window.localStorage.getItem(key) !== null,
    { timeout: 15000 },
    STORE,
  );

  for (const row of surfaces) {
    const role = roleFor(row.guard);
    const seeded = await seed(page, role);
    if (!seeded.ok) {
      results.push({ ...row, role, ok: false, reason: seeded.reason });
      continue;
    }

    // A row with URL state can have two legitimate states: the base page and
    // the page with its drawer/param open. Try the base first, then the state,
    // so one row can document either kind of proof.
    const candidates = [new URL(`${base}${row.path}`)];
    if (row.urlState.includes("?kode=")) {
      const code = await page.evaluate((key) => {
        const raw = window.localStorage.getItem(key);
        const state = JSON.parse(raw)?.state ?? {};
        const mine = (state.orders ?? []).find((o) => o.customerId === state.currentUserId);
        return (mine ?? (state.orders ?? [])[0])?.code ?? null;
      }, STORE);
      if (code) {
        const withCode = new URL(`${base}${row.path}`);
        withCode.searchParams.set("kode", code);
        candidates.push(withCode);
      }
    }

    let missing = [];
    for (const candidate of candidates) {
      await page.goto(candidate.href, { waitUntil: "domcontentloaded" });
      missing = [];
      for (const proof of row.proofs) {
        if (!(await waitForProof(page, proof, timeout))) missing.push(proof);
      }
      if (missing.length === 0) break;
    }

    let shot = null;
    if (allShots || missing.length > 0) {
      shot = join(SHOTS, `${row.path.replace(/\//g, "_") || "root"}.png`);
      await page.screenshot({ path: shot, fullPage: false });
    }

    results.push({ ...row, role, ok: missing.length === 0, missing, shot });
  }
} finally {
  await browser.close();
}

const ok = results.every((r) => r.ok);
if (asJson) {
  console.log(JSON.stringify({ ok, base, results }, null, 2));
} else {
  for (const r of results) {
    const label = `${r.path}`.padEnd(26);
    const who = (r.role ?? "guest").padEnd(7);
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${label}${who}${r.ok ? "" : r.reason ?? `missing: ${r.missing.join(" | ")}`}`);
    if (!r.ok && r.shot) console.log(`${" ".repeat(6)}screenshot: ${r.shot}`);
  }
  const passed = results.filter((r) => r.ok).length;
  console.log(`\nsurfaces: ${passed}/${results.length} passed`);
  if (!ok) console.log("Start with the screenshot of the first FAIL.");
}

process.exit(ok ? 0 : 1);
