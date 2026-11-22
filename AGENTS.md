<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:laundria-rules -->

## Laundria rules

**Definition of done.** Run `npm run check` before saying a task is done, and paste
the output line (`check: N/N gates passed @ <sha> · <time>`). If it fails, fix it or
say why it cannot pass. Never report "verified" without the gate output.
`npm run check:fast` skips the build for the inner loop; it is not the done signal.
For UI changes, `npm run surfaces` must pass with `npm run dev` running.

**Pull requests.** The body is optional and there is no template. A blank body is
honest; an unfilled form is not. If a reviewer needs the evidence, they will ask
for the receipt line — paste it as a comment.

| # | Rule | Enforced by |
|---|---|---|
| 1 | Role gating is `RoleGuard`, never nav filtering. Owner-only pages pass `adminLevel="owner"`. | `check: guards`, `check: layout-guard:*` |
| 2 | Four order statuses: `menunggu`, `dicuci`, `siap`, `selesai`. No cancelled status. The word may appear in prose ("tidak bisa dibatalkan"). | `check: no-status` |
| 3 | Order codes are `Z1-YYMMDD-NNN`, from `nextOrderCode`. | review |
| 4 | No `new Date()` for display time — use `DEMO_NOW` from `src/lib/demo-date.ts`. `Date.now()` is fine for ids and durations. | `check: no-clock` |
| 5 | Tokens live in `@theme static` in `src/app/tokens.css`, imported by `globals.css`. There is no `tailwind.config.*`. | `check: tailwind-config` |
| 6 | Store actions return `{ ok: false, error }`; never throw for expected failures. | types (`Result<T>`) |
| 7 | Drawers are URL state (`?detail=`, `?status=`, `?hapus=`, `?kode=`), not routes. | review |
| 8 | One primary action per screen. Sentence case, no eyebrows, no tracked caps, no decorative dots, no emoji icons. | review |
| 9 | Pure logic changes ship with tests in `scripts/tests/`, same PR. | `check: tests` (the suite runs; coverage is review) |

`scripts/check.mjs` is the source of truth. If a rule and the gate disagree, the gate
wins and this file gets fixed.

<!-- END:laundria-rules -->
