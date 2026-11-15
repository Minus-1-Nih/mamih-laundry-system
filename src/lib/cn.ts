export type ClassValue = string | false | null | undefined;

/**
 * Join class names, dropping falsey entries.
 * Deliberately small: the design system avoids conflicting utilities
 * rather than relying on tailwind-merge.
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
