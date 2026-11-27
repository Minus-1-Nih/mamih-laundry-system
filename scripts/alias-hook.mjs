// Resolves the "@/..." path alias for Node's ESM loader, which has no idea
// about tsconfig paths. Only needed by `node --test`; Next handles the alias
// itself at build time.
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function resolve(specifier, context, next) {
  if (!specifier.startsWith("@/")) return next(specifier, context);

  // fileURLToPath, not URL#pathname: pathname is "/C:/..." on Windows.
  const base = fileURLToPath(
    new URL(`../src/${specifier.slice(2)}`, import.meta.url),
  );

  for (const candidate of [`${base}.ts`, `${base}/index.ts`]) {
    if (existsSync(candidate)) return next(pathToFileURL(candidate).href, context);
  }

  throw new Error(
    `Cannot resolve "${specifier}" from ${context.parentURL}: ` +
      `no .ts or /index.ts under src/. Check the import path.`,
  );
}
