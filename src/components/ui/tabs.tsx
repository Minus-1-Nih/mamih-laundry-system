import Link from "next/link";
import { cn } from "@/lib/cn";

export interface TabItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  className?: string;
}

export function Tabs({ items, className }: TabsProps) {
  return (
    <nav
      aria-label="Tab"
      className={cn("inline-flex rounded-pill bg-track p-1", className)}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "rounded-pill px-4 py-1.5 text-sm font-medium transition-colors",
            item.active
              ? "bg-surface text-ink shadow-sm"
              : "text-muted hover:text-ink",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
