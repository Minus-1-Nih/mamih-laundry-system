import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

export const statusLabels: Record<OrderStatus, string> = {
  menunggu: "Menunggu Penjemputan",
  dicuci: "Sedang Dicuci",
  siap: "Siap Diantar",
  selesai: "Selesai",
};

const tones: Record<OrderStatus, string> = {
  menunggu: "bg-waiting-bg text-waiting-fg",
  dicuci: "bg-washing-bg text-washing-fg",
  siap: "bg-ready-bg text-ready-fg",
  selesai: "bg-done-bg text-done-fg",
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
        "inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-medium",
        isOverdue ? "bg-danger-bg text-danger-fg" : tones[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
