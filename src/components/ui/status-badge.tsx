import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

export const statusLabels: Record<OrderStatus, string> = {
  menunggu: "Menunggu Penjemputan",
  dicuci: "Sedang Dicuci",
  siap: "Siap Diantar",
  selesai: "Selesai",
};

/* Status is a dot plus an ink label. Colour never carries the meaning alone:
   the label sits beside it, and overdue adds a spoken word for screen readers. */
const dots: Record<OrderStatus, string> = {
  menunggu: "bg-gold",
  dicuci: "bg-accent/50",
  siap: "bg-accent",
  selesai: "bg-muted/60",
};

export interface StatusBadgeProps {
  status: OrderStatus;
  overdue?: boolean;
  className?: string;
}

export function StatusBadge({ status, overdue = false, className }: StatusBadgeProps) {
  const isOverdue = overdue && status === "menunggu";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap text-13 font-medium text-ink",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          isOverdue ? "bg-danger-fg" : dots[status],
        )}
      />
      {statusLabels[status]}
      {isOverdue ? <span className="sr-only">Terlambat dijemput</span> : null}
    </span>
  );
}
