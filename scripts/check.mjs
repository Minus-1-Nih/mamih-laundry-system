#!/usr/bin/env node
// scripts/check.mjs — the one command that answers "is this done?"
//
// Gates, in order: typecheck, lint, build, then structural invariants the
// compiler cannot see. Exit code 0 only when every gate passes.
// Notes are reported but never fail the run.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const BIN = join(ROOT, "node_modules", ".bin");
const EXE = process.platform === "win32" ? ".cmd" : "";
const argv = process.argv.slice(2);

if (argv.includes("--help") || argv.includes("-h")) {
  console.log(`Usage: node scripts/check.mjs [--json]

Exit code is 0 only when every gate passes.

Gates:
  typecheck        tsc --noEmit
  lint             eslint .
  build            next build (catches RSC / client-boundary mistakes)
  tailwind-config  tailwind.config.* must not exist (Tailwind 4 reads @theme)
  route-map        every src/app/**/page.tsx must have a row in docs/features.md
  no-clock         no new Date() outside src/lib (use DEMO_NOW from demo-date.ts)
  no-status        no "dibatalkan" status (the app has four statuses)
  guards           /admin/akun still requires adminLevel="owner"
  layout-guard:*   /admin, /driver, /akun layouts still render RoleGuard

Options:
  --json   machine-readable: {"ok":bool,"results":[...],"notes":[...]}

Notes are reported but never fail the run.
`);
  process.exit(0);
}

const asJson = argv.includes("--json");
const results = [];
const notes = [];
const record = (id, ok, detail = "") => results.push({ id, ok, detail });

function run(id, cmd, args) {
  const bin = join(BIN, cmd + EXE);
  if (!existsSync(bin)) {
    record(id, false, `Missing binary ${relative(ROOT, bin)}. Run "npm install" first.`);
    return;
  }
  const r = spawnSync(bin, args, { cwd: ROOT, encoding: "utf8" });
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
  record(id, r.status === 0, out.split("\n").slice(-25).join("\n"));
}

function files(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) files(p, acc);
    else if (/\.(ts|tsx)$/.test(entry.name)) acc.push(p);
  }
  return acc;
}

// src/lib is exempt from the clock and status gates: seed.ts and demo-date.ts
// legitimately build timestamps, and they are the source of "now".
const appFiles = files(join(ROOT, "src")).filter(
  (f) => !relative(ROOT, f).startsWith("src/lib/"),
);
const scanning = (pred) =>
  appFiles.filter((f) => pred(readFileSync(f, "utf8"))).map((f) => relative(ROOT, f));

// --- gates that shell out ---------------------------------------------------
run("typecheck", "tsc", ["--noEmit"]);
run("lint", "eslint", ["."]);
run("build", "next", ["build"]);

// --- structural gates -------------------------------------------------------
record(
  "tailwind-config",
  !["ts", "js", "mjs", "cjs"].some((e) => existsSync(join(ROOT, `tailwind.config.${e}`))),
  "Tailwind 4 reads @theme in src/app/globals.css. Delete the config file rather than adding one.",
);

// --- feature map coverage ---------------------------------------------------
const APP = join(ROOT, "src/app");
const routeOf = (file) => {
  const rel = relative(APP, file)
    .replace(/page\.tsx$/, "")
    .replace(/\([^)]+\)\//g, "")
    .replace(/\/$/, "");
  return rel === "" ? "/" : `/${rel}`;
};
const routes = files(APP).filter((f) => f.endsWith("page.tsx")).map(routeOf).filter((r) => r !== "/");

const mapPath = join(ROOT, "docs/features.md");
const mapText = existsSync(mapPath) ? readFileSync(mapPath, "utf8") : "";
const documented = new Set(
  [...mapText.matchAll(/`([^`]+)`/g)]
    .map((m) => m[1].trim())
    .filter((s) => s.startsWith("/") && !/[\s.]/.test(s)),
);
const missing = routes.filter((r) => !documented.has(r));

record(
  "route-map",
  routes.length > 0 && missing.length === 0,
  routes.length === 0
    ? "No pages found under src/app. Has the route tree moved?"
    : `These routes have no row in docs/features.md:\n  ${missing.join(
        "\n  ",
      )}\nAdd a row (route | role | guard | proof) in the same PR.`,
);

const clock = scanning((s) => /\bnew Date\(\s*\)/.test(s));
record(
  "no-clock",
  clock.length === 0,
  clock.length ? `Use DEMO_NOW from src/lib/demo-date.ts instead:\n  ${clock.join("\n  ")}` : "",
);

const cancelled = scanning((s) => /["']dibatalkan["']/i.test(s));
record(
  "no-status",
  cancelled.length === 0,
  cancelled.length
    ? `The app has four statuses (menunggu, dicuci, siap, selesai) and no cancelled state:\n  ${cancelled.join("\n  ")}`
    : "",
);

const akun = join(ROOT, "src/app/admin/akun/page.tsx");
record(
  "guards",
  existsSync(akun) && /adminLevel="owner"/.test(readFileSync(akun, "utf8")),
  'src/app/admin/akun/page.tsx must render <RoleGuard role="admin" adminLevel="owner">. Hiding a nav item is not a guard.',
);

for (const [route, role] of [["admin", "admin"], ["driver", "driver"], ["akun", "customer"]]) {
  const layout = join(ROOT, `src/app/${route}/layout.tsx`);
  const ok =
    existsSync(layout) &&
    new RegExp(`<RoleGuard[^>]*role="${role}"`).test(readFileSync(layout, "utf8"));
  record(
    `layout-guard:${route}`,
    ok,
    `src/app/${route}/layout.tsx must render <RoleGuard role="${role}">.`,
  );
}

// --- notes (reported, never fail) ------------------------------------------
for (const f of scanning((s) => /\bDate\.now\(\)/.test(s))) {
  notes.push(
    `${f} uses Date.now(). OK for ids and durations, never for display time — use DEMO_NOW.`,
  );
}

// --- report -----------------------------------------------------------------
const ok = results.every((r) => r.ok);

if (asJson) {
  console.log(JSON.stringify({ ok, results, notes }, null, 2));
} else {
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.id}`);
    if (!r.ok && r.detail) console.log(r.detail.replace(/^/gm, "      "));
  }
  if (notes.length) {
    console.log("");
    for (const n of notes) console.log(`NOTE  ${n}`);
  }
  const passed = results.filter((r) => r.ok).length;
  console.log(`\n${passed}/${results.length} gates passed`);
  if (!ok) console.log("Fix the FAIL lines above, then run this again.");
}

process.exit(ok ? 0 : 1);
