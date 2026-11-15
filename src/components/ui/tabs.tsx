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
      className={cn("max-w-full overflow-x-auto border-b border-rule", className)}
    >
      <div className="inline-flex min-w-full">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-[border-color,color] duration-[var(--dur-micro)]",
              item.active
                ? "border-accent text-ink"
                : "border-transparent text-muted hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
