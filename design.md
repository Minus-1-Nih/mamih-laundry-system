# Design: Laundria

The locked system. Every screen shares it; change it on purpose.

## System
- Genre: editorial
- Shape: Split Studio for the public page · app screens inside the product's own shells
- Theme: Solstice (deal 3/3), brand-tinted: warm cream paper, green-black ink, one Laundria green signal, gold hairlines, hard paper shadows
- Axes: light / high-contrast-serif / chromatic-green · posture: restrained
- Signature: the order timeline as a ruled almanac line, from public sample to customer story, admin strip and driver stepper

## Tokens
`src/app/tokens.css` is the source of truth. The roles:
```css
:root {
  --color-paper: oklch(97.4% 0.010 92);  --color-paper-2: oklch(94.5% 0.016 92);  --color-paper-3: oklch(89% 0.028 90);
  --color-ink: oklch(24% 0.024 158);  --color-ink-2: oklch(34% 0.022 158);  --color-muted: oklch(48% 0.020 158);  --color-rule: oklch(84% 0.020 100);
  --color-accent: oklch(47.5% 0.095 158);  --color-accent-ink: oklch(97% 0.012 92);  --color-focus: oklch(52% 0.16 158);
  --color-gold: oklch(74% 0.14 75);  --color-gold-2: oklch(84% 0.11 80);
  --font-display: "Yeseva One", ui-serif, Georgia, serif;  --font-body: "Archivo", ui-sans-serif, system-ui, sans-serif;  --font-outlier: "Archivo Narrow", "Arial Narrow", ui-sans-serif, sans-serif;
  --radius-card: 0;  --radius-pill: 999px;  --rule-hair: 1px;
  --shadow-card: 10px 10px 0 var(--color-paper-3);
}
```
The spacing scale, type scale, easings and durations live in `tokens.css`.

## Type
- Display: Yeseva One 400, roman, sentence case, line-height 1.0; page h1 and screen titles only.
- Body/UI: Archivo 400 and 500; 600 only for emphasis in tables and controls.
- Outlier: Archivo Narrow 600 for dates, captions, small print and axis labels. No mono.
- Three weights at most: 400, 500, 600. Never 700.
- App screens: h1 32px, h2 24px, h3 18px, body 16px, labels 13px. Fixed 1.125 to 1.2 ratio.

## Controls
- Primary: Laundria green fill, cream text, pill, 48px on public/auth, 40px in app screens.
- Secondary: 1px ink or green outline, same radius and height; destructive is a text or danger-fill action, never the page's primary.
- Fields: square, 1px `--color-muted` border on paper, 44 to 48px, focus ring 2px `--color-focus` inset. No border-colour change on focus.
- Focus: 2px `--color-focus` with 2px offset, instant. On green surfaces use cream.
- Press: one 1px translate, 120ms; hover changes one colour step, 220ms.

## Surfaces
- Paper ground, paper-2 wells, paper-3 hard shadow. Square wells, 2px ink border only on raised objects; no rounded cards.
- One hard paper shadow per raised object; no soft shadows, no gradients, no glass.
- Tables before cards in app screens. Horizontal hairlines only, no outer border.
- Gold is a hairline and inset rule only, never text.
- Status colour is semantic: waiting gold tint, washing green tint, ready green fill, done muted green, danger red only.
- One ink band at most on a page; app screens use ink only for the primary button and table rules.

## Motion
- Character: still. State only, 120ms micro and 220ms short, transform and opacity only.
- No reveal on load in app screens. No loop, no counter, no parallax.
- Under reduced motion every transition ends at once.

## Exports
`src/app/tokens.css` in this project, imported after Tailwind. Tailwind utilities read the same names through `@theme static`.
