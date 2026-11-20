# Design: Laundria

The locked system. Every screen shares it; change it on purpose.

v4 replaces v3 (editorial / Solstice, green → indigo). Changed: brand-led warm voice, the
display face moves from Yeseva to the Phase 1 gate winner, the mascot becomes the mark,
rounded controls, `--font-brand`. Kept: cream paper, indigo-black ink, Mamih pink signal,
Archivo body, hard offset depth, the ruled timeline, square data wells.

`src/app/tokens.css` carries v2.1 until the MNI-22 Phase 1a run lands. This file is the target,
not a description of the current CSS. v3 remains in git history; v4 is the single source.

## System
- Genre: brand-led, warm editorial — dense, data-first screens; the mascot supplies the loud register, not the layout
- Brand: Laundria by Mamih Laundry. The mascot is the mark; the palette is sampled from it
- Material: printed depth — die-cut edge, hard offset, flat fills, no gradient
- Axes: light / warm display / chromatic-indigo + pink · posture: warm, one loud moment per public page
- Shape: Split Studio for the public page · app screens inside the product's own shells
- Signature: the order timeline as a ruled almanac line, from public sample to customer story, admin strip and driver stepper

## Brand
- Asset: `public/brand/laundriamascot.png` — 235×205, transparent, the only copy; served as `/brand/laundriamascot.png`.
- Lockup: mascot mark + `Laundria` in `--font-brand` (Baloo 2 800, sentence case) + subtitle `by Mamih Laundry` in small-print. The whole lockup links home. The face alone appears only as favicon and tab icon.
- Two tones, ground-dependent. `onPaper`: indigo fill, 4px gold hard offset, no white outline (invisible on cream). `onInk`: cream fill, 2px indigo stroke behind the fill (`paint-order`), 4px gold offset.
- The mascot is a mark, not illustration. Four sizes: 24 / 40 / 80 / 120px. Allowed: shell header, favicon, empty states, success and error moments, driver queue header. Never inside tables or forms, never behind text, never more than once per screen, never above 120px (the source is 235×205).
- The die-cut edge belongs to raised brand objects only: the lockup, the sticker, one CTA. Not to tables, not to every card.
- Pink is a signal, not a text colour. `--color-brand` is 4.0:1 on paper — large text and UI shapes only. Body copy on pink uses `--color-brand-deep` (5.2:1) or cream.
- Destructive actions separate from brand pink by shape, not hue: outline plus a trash icon in `--color-danger-fg`, and brand pink never sits within one card of a delete.

## Tokens
`src/app/tokens.css` is where these land. The roles:
```css
:root {
  --color-paper: oklch(97.8% 0.008 92);  --color-paper-2: oklch(94.5% 0.014 92);
  --color-paper-3: oklch(89% 0.024 90);  --color-paper-hi: oklch(99.2% 0.005 92);
  --color-ink: oklch(24% 0.030 285);  --color-ink-2: oklch(34% 0.028 285);
  --color-muted: oklch(48% 0.025 285);  --color-rule: oklch(84% 0.015 110);
  --color-accent: oklch(42% 0.200 277);  --color-accent-hover: oklch(37% 0.185 277);
  --color-accent-soft: oklch(93% 0.040 285);  --color-accent-ink: oklch(97.8% 0.008 92);
  --color-brand: oklch(61% 0.217 8);  --color-brand-deep: oklch(54.5% 0.201 9);
  --color-focus: oklch(52% 0.19 277);
  --color-gold: oklch(74% 0.14 75);  --color-gold-2: oklch(84% 0.11 80);
  --font-brand: var(--font-baloo), ui-rounded, system-ui, sans-serif;
  /* Display is the Phase 1 gate winner; Fraunces is the working default. */
  --font-display: var(--font-fraunces), ui-serif, Georgia, serif;
  --font-body: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
  --radius-control: 10px;  --radius-card: 14px;  --radius-well: 0px;  --radius-full: 999px;
  --shadow-card: 10px 10px 0 var(--color-paper-3);  --shadow-sticker: 4px 4px 0 var(--color-gold-2);
}
```
Measured on paper: ink 15.6:1, ink-2 11.2:1, muted 6.2:1, accent 8.7:1, brand-deep 5.2:1, brand 4.0:1.

## Type
- Display: chosen at the Phase 1 gate — Fraunces (default), Bricolage Grotesque, or Young Serif; one weight, roman, sentence case, line-height 1.0; page h1 and screen titles only. Yeseva retires when the gate confirms.
- Brand: Baloo 2 800, sentence case, the lockup only. Never headings, labels, buttons or data.
- Body/UI: Archivo 400 and 500; 600 only for emphasis in tables and controls.
- Outlier: Archivo Narrow 600 for dates, captions, small print and axis labels. No mono.
- Three weights at most: 400, 500, 600. Never 700.
- App screens: h1 32px, h2 24px, h3 18px, body 16px, labels 13px. Fixed 1.125 to 1.2 ratio.

## Controls
- Primary: indigo fill, cream text, 10px radius, 48px on public/auth, 40px in app screens.
- Secondary: 1px indigo outline, same radius and height.
- Destructive: 1px danger outline plus a trash icon, never a pink fill, never the page's primary.
- Fields: 10px radius, 1px `--color-muted` border on paper, 44 to 48px, focus ring 2px `--color-focus` inset. No border-colour change on focus.
- Focus: 2px `--color-focus` with 2px offset, instant. On indigo surfaces use cream.
- Press: one 1px translate, 120ms; hover changes one colour step, 220ms.
- Radius: controls and cards round (10 / 14); data wells stay square so tables keep their grid; `--radius-full` only for the mascot and count badges.

## Surfaces
- Paper ground, paper-2 wells, paper-3 hard offset. Die-cut edge on raised brand objects only.
- One hard shadow per raised object; no soft shadows, no gradients, no glass. The reference's purple-to-blue sky is not built.
- Tables before cards in app screens. Horizontal hairlines only, no outer border.
- Gold is a hairline, an offset and confetti only, never text.
- Status colour is semantic: waiting gold tint, washing indigo tint, ready indigo fill, done muted paper-2, danger red only.
- One ink band at most on a page; app screens use ink only for the primary button and table rules.
- Loud moment: one per public page at most. App screens stay quiet.

## Motion
- Character: still. State only, 120ms micro and 220ms short, transform and opacity only.
- No reveal on load in app screens. No loop, no counter, no parallax — the sticker does not bob.
- Under reduced motion every transition ends at once.

## Exports
`src/app/tokens.css` in this project, imported after Tailwind. Tailwind utilities read the same names through `@theme static`.
This file is at the repo root because Hallmark reads it there; `src/app/globals.css` carries the provenance header.
