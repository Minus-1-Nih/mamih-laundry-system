import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import type { Order, StatusEvent } from "@/lib/types";

type TimelineVariant = "admin" | "customer";
type StepState = "done" | "current" | "pending";

interface TimelineStep {
  label: string;
  hint?: string;
  actor?: string;
  at?: string;
  state: StepState;
}

function findEvent(
  order: Order,
  notes: string[],
): StatusEvent | undefined {
  return [...order.history]
    .reverse()
    .find((event) =>
      notes.some((note) => event.note?.toLowerCase().includes(note)),
    );
}

function eventTime(event?: StatusEvent): string | undefined {
  return event ? `${formatDateTime(event.at)} WIB` : undefined;
}

function buildSteps(order: Order, variant: TimelineVariant): TimelineStep[] {
  const created =
    order.history.find(
      (event) =>
        event.note === "Pesanan dibuat" || event.note === "Pesanan diterima",
    ) ?? order.history[0];
  const pickup =
    findEvent(order, ["penjemputan selesai"]) ??
    order.history.find((event) => event.status === "dicuci");
  const washing = findEvent(order, ["selesai dicuci", "sedang dicuci"]);
  const ready =
    findEvent(order, ["siap diantar"]) ??
    order.history.find((event) => event.status === "siap");
  const delivered =
    findEvent(order, ["diterima pelanggan"]) ??
    order.history.find((event) => event.status === "selesai");

  const reachedPickup = order.status !== "menunggu";
  const reachedWash = order.status === "siap" || order.status === "selesai";
  const reachedReady = order.status === "siap" || order.status === "selesai";
  const reachedDone = order.status === "selesai";

  if (variant === "customer") {
    return [
      {
        label: "Pesanan diterima",
        at: eventTime(created),
        state: "done",
      },
      {
        label: "Penjemputan selesai",
        at: eventTime(pickup),
        hint: reachedPickup ? undefined : "Menunggu penjemputan",
        state: reachedPickup
          ? "done"
          : order.status === "menunggu"
            ? "current"
            : "pending",
      },
      {
        label: "Sedang dicuci",
        at: eventTime(washing),
        hint:
          order.status === "dicuci" || reachedWash
            ? undefined
            : "Menunggu proses cuci",
        state: reachedWash
          ? "done"
          : order.status === "dicuci"
            ? "current"
            : "pending",
      },
      {
        label: "Siap diantar",
        at: eventTime(ready),
        hint: reachedReady
          ? undefined
          : "Estimasi 5 November 2026, 17.00-22.00 WIB",
        state: reachedDone
          ? "done"
          : order.status === "siap"
            ? "current"
            : "pending",
      },
      {
        label: "Selesai",
        at: eventTime(delivered),
        hint: reachedDone ? undefined : "Menunggu pengantaran",
        state: reachedDone ? "done" : "pending",
      },
    ];
  }

  return [
    {
      label: "Pesanan dibuat",
      at: eventTime(created),
      state: "done",
    },
    {
      label: "Penjemputan selesai",
      at: eventTime(pickup),
      actor: reachedPickup ? pickup?.by : undefined,
      hint: reachedPickup ? undefined : "Menunggu penjemputan",
      state: reachedPickup
        ? "done"
        : order.status === "menunggu"
          ? "current"
          : "pending",
    },
    {
      label: order.status === "dicuci" ? "Sedang dicuci" : "Selesai dicuci",
      at: eventTime(washing),
      hint:
        order.status === "dicuci" || reachedWash
          ? undefined
          : "Menunggu proses cuci",
      state: reachedWash
        ? "done"
        : order.status === "dicuci"
          ? "current"
          : "pending",
    },
    {
      label: "Siap diantar",
      at: eventTime(ready),
      actor: reachedReady ? ready?.by : undefined,
      hint: reachedReady ? undefined : "Menunggu siap diantar",
      state: reachedReady ? "done" : "pending",
    },
    {
      label: "Diterima pelanggan",
      at: eventTime(delivered),
      actor: reachedDone ? delivered?.by : undefined,
      hint: reachedDone ? undefined : "Menunggu diterima pelanggan",
      state: reachedDone ? "done" : "pending",
    },
  ];
}

export interface OrderTimelineProps {
  order: Order;
  variant?: TimelineVariant;
  className?: string;
}

export function OrderTimeline({
  order,
  variant = "admin",
  className,
}: OrderTimelineProps) {
  const steps = buildSteps(order, variant);

  return (
    <ol
      aria-label="Riwayat status pesanan"
      className={cn("border-t border-ink", className)}
    >
      {steps.map((step, index) => {
        const done = step.state === "done";
        const current = step.state === "current";
        const meta = step.at ?? step.hint;

        return (
          <li
            key={step.label}
            className={cn(
              "grid grid-cols-[3.25rem_minmax(0,1fr)] items-start gap-x-3 border-b border-rule py-3",
              current && "bg-accent-soft shadow-[inset_2px_0_0_var(--color-accent)]",
            )}
          >
            <div className="flex items-center gap-2 pt-0.5">
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

            <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 pr-2">
              <p
                className={cn(
                  "text-sm font-medium",
                  current ? "text-accent" : done ? "text-ink" : "text-muted",
                )}
              >
                {step.label}
                {step.actor ? `, ${step.actor}` : ""}
              </p>
              {meta ? (
                <p className="small-print text-muted">{meta}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
