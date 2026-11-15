import { ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { isOverdue } from "@/lib/format";
import type { Order, User, Zone } from "@/lib/types";

export interface OrderDocketListProps {
  orders: Order[];
  zones: Zone[];
  users?: User[];
  onOpen: (code: string) => void;
}

export function OrderDocketList({
  orders,
  zones,
  users,
  onOpen,
}: OrderDocketListProps) {
  return (
    <ul className="border-t border-rule md:hidden">
      {orders.map((order) => {
        const zone = zones.find((item) => item.id === order.zoneId);
        const driver = users?.find((item) => item.id === order.driverId);
        return (
          <li key={order.code} className="border-b border-rule last:border-b-0">
            <button
              type="button"
              onClick={() => onOpen(order.code)}
              className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-[var(--dur-micro)] hover:bg-paper-2"
            >
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-outlier text-13 font-semibold text-ink">
                    {order.code}
                  </span>
                  <StatusBadge
                    status={order.status}
                    overdue={isOverdue(order)}
                  />
                </span>
                <span className="mt-1.5 block text-sm font-medium text-ink">
                  {order.customerName}
                </span>
                <span className="mt-0.5 block text-13 text-muted">
                  {order.zoneId}, {zone?.name ?? "Zona"}, {order.schedule}
                </span>
                <span className="mt-0.5 block text-13 text-muted">
                  {order.service}, {order.weight}
                  {driver ? `, ${driver.name}` : ""}
                </span>
              </span>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
