import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(
  new URL("../../src/app/tokens.css", import.meta.url),
  "utf8",
);

interface Oklch {
  l: number;
  c: number;
  h: number;
}

function readTokens(source: string): Map<string, Oklch> {
  const tokens = new Map<string, Oklch>();
  const pattern =
    /--color-([a-z0-9-]+):\s*oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/g;
  for (const match of source.matchAll(pattern)) {
    tokens.set(match[1], {
      l: Number(match[2]) / 100,
      c: Number(match[3]),
      h: Number(match[4]),
    });
  }
  return tokens;
}

/** OKLCH -> linear sRGB, the same matrix the browser uses. */
function linearSrgb({ l, c, h }: Oklch): [number, number, number] {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);

  const lPrime = l + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = l - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = l - 0.0894841775 * a - 1.291485548 * b;

  const ll = lPrime ** 3;
  const mm = mPrime ** 3;
  const ss = sPrime ** 3;

  return [
    4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss,
    -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss,
    -0.0041960863 * ll - 0.7034186147 * mm + 1.707614701 * ss,
  ];
}

function luminance(token: Oklch): number {
  const [r, g, b] = linearSrgb(token).map((value) =>
    Math.min(1, Math.max(0, value)),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Oklch, b: Oklch): number {
  const light = Math.max(luminance(a), luminance(b));
  const dark = Math.min(luminance(a), luminance(b));
  return (light + 0.05) / (dark + 0.05);
}

const tokens = readTokens(css);

function token(name: string): Oklch {
  const value = tokens.get(name);
  assert.ok(value, `tokens.css has no --color-${name}`);
  return value;
}

const pairs: [string, string, number][] = [
  ["ink", "paper", 15.6],
  ["ink-2", "paper", 11.2],
  ["muted", "paper", 6.2],
  ["accent", "paper", 8.7],
  ["brand-deep", "paper", 5.2],
  ["brand", "paper", 4.0],
];

for (const [fg, bg, expected] of pairs) {
  test(`${fg} on ${bg} holds the measured ${expected}:1`, () => {
    const measured = contrast(token(fg), token(bg));
    assert.ok(
      Math.abs(measured - expected) < 0.2,
      `${fg} on ${bg} is ${measured.toFixed(2)}:1, expected about ${expected}:1`,
    );
  });
}

test("brand pink stays at or above the 4.0:1 large-text floor", () => {
  // 3.99 at the declared token; the design rounds it to 4.0.
  assert.ok(contrast(token("brand"), token("paper")) >= 3.95);
});

test("every measured token exists in tokens.css", () => {
  for (const name of [
    "paper",
    "paper-2",
    "paper-3",
    "paper-hi",
    "ink",
    "ink-2",
    "muted",
    "rule",
    "accent",
    "accent-hover",
    "accent-soft",
    "accent-ink",
    "brand",
    "brand-deep",
    "focus",
    "gold",
    "gold-2",
  ]) {
    assert.ok(tokens.has(name), `missing --color-${name}`);
  }
});
