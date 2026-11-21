"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDateKeyLong, formatDateTime, orderArrivalKey } from "@/lib/format";
import { sessionWindowLabel } from "@/lib/sessions";
import { useAppStore } from "@/lib/store";
import type { Order, StatusEvent } from "@/lib/types";

function findEvent(order: Order, notes: string[]): StatusEvent | undefined {
  return [...order.history]
    .reverse()
    .find((event) =>
      notes.some((note) => event.note?.toLowerCase().includes(note)),
    );
}

function stamp(event?: StatusEvent): string | undefined {
  return event ? `${formatDateTime(event.at)} WIB` : undefined;
}

export function orderArrivalLabel(order: Order): string {
  return formatDateKeyLong(orderArrivalKey(order));
}

export interface CustomerOrderProgressProps {
  order: Order;
  className?: string;
  showStage?: boolean;
}

export function CustomerOrderProgress({
  order,
  className,
  showStage = true,
}: CustomerOrderProgressProps) {
  const sessions = useAppStore((state) => state.sessions);
  const created =
    order.history.find(
      (event) =>
        event.note === "Pesanan dibuat" || event.note === "Pesanan diterima",
    ) ?? order.history[0];
  const pickup = findEvent(order, ["penjemputan selesai"]);
  const washing = findEvent(order, ["sedang dicuci", "selesai dicuci"]);
  const ready = findEvent(order, ["siap diantar"]);
  const delivered = findEvent(order, ["diterima pelanggan"]);

  const reachedPickup = order.status !== "menunggu";
  const reachedWash = order.status === "siap" || order.status === "selesai";
  const reachedReady = order.status === "siap" || order.status === "selesai";
  const reachedDone = order.status === "selesai";

  const stage =
    order.status === "menunggu"
      ? 2
      : order.status === "dicuci"
        ? 3
        : order.status === "siap"
          ? 4
          : 5;

  const steps = [
    {
      label: "Pesanan diterima",
      description: "Pesanan Anda terdaftar di Laundria.",
      time: stamp(created),
      state: "done" as const,
    },
    {
      label: "Penjemputan selesai",
      description: pickup
        ? `Dijemput oleh ${pickup.by}, ${order.zoneId}.`
        : "Kurir akan menjemput cucian di alamat Anda.",
      time: stamp(pickup) ?? "Menunggu penjemputan",
      state: reachedPickup ? ("done" as const) : ("current" as const),
    },
    {
      label: "Sedang dicuci",
      description: "Cucian sedang dicuci, dikeringkan, dan disetrika.",
      time:
        stamp(washing) ??
        (order.status === "menunggu"
          ? "Setelah penjemputan"
          : "Sedang berjalan"),
      state: reachedWash
        ? ("done" as const)
        : order.status === "dicuci"
          ? ("current" as const)
          : ("pending" as const),
    },
    {
      label: "Siap diantar",
      description: reachedReady
        ? "Cucian siap diantar ke alamat Anda."
        : "Kami akan menginformasikan saat cucian siap diantar.",
      time:
        stamp(ready) ??
        (reachedWash
          ? "Menunggu penjadwalan"
          : `Estimasi ${orderArrivalLabel(order)}, ${sessionWindowLabel(
              "delivery",
              sessions,
            )}`),
      state: reachedDone
        ? ("done" as const)
        : order.status === "siap"
          ? ("current" as const)
          : ("pending" as const),
    },
    {
      label: "Selesai",
      description: "Cucian bersih tiba di alamat Anda.",
      time: stamp(delivered) ?? "Menunggu pengantaran",
      state: reachedDone ? ("done" as const) : ("pending" as const),
    },
  ];

  return (
    <div className={className}>
      {showStage ? (
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-rule pb-2">
          <p className="small-print text-muted">Almanak pesanan</p>
          <p className="small-print text-muted">Tahap {stage} dari 5</p>
        </div>
      ) : null}

      <ol aria-label="Tahapan pesanan" className="border-t border-ink">
        {steps.map((step, index) => {
          const done = step.state === "done";
          const current = step.state === "current";

          return (
            <li
              key={step.label}
              className={cn(
                "grid grid-cols-[3.25rem_minmax(0,1fr)] items-start gap-x-3 border-b border-rule py-3.5",
                current &&
                  "bg-accent-soft shadow-[inset_2px_0_0_var(--color-accent)]",
              )}
            >
              <div className="flex items-center gap-2 pt-1">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-2.5 w-2.5 shrink-0 items-center justify-center",
                    done && "bg-accent text-accent-ink",
                    current && "border-2 border-accent bg-paper",
                    step.state === "pending" && "border border-rule bg-paper",
                  )}
                >
                  {done ? <Check className="h-2 w-2" strokeWidth={3} /> : null}
                </span>
                <span className="small-print text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 pr-2">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      current ? "text-accent" : done ? "text-ink" : "text-muted",
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="small-print text-muted">{step.time}</p>
                </div>
                <p className="mt-1 text-13 leading-snug text-muted">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
