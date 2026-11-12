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
          : "Estimasi 5 November 2026, 17.00–22.00 WIB",
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
    <div className={cn("relative", className)}>
      <div
        aria-hidden="true"
        className="absolute bottom-6 left-[13px] top-2 w-px bg-border"
      />
      <ol>
        {steps.map((step, index) => {
          const done = step.state === "done";
          const current = step.state === "current";

          return (
            <li
              key={step.label}
              className="relative flex gap-3.5 pb-5 last:pb-0"
            >
              <span
                className={cn(
                  "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-13 font-semibold",
                  done && "border-primary bg-primary text-white",
                  current && "border-primary bg-surface text-primary",
                  step.state === "pending" &&
                    "border-border bg-surface text-muted",
                )}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : current ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                ) : (
                  index + 1
                )}
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className={cn(
                    "text-sm font-medium",
                    current
                      ? "text-primary"
                      : done
                        ? "text-ink"
                        : "text-muted",
                  )}
                >
                  {step.label}
                  {step.actor ? `, ${step.actor}` : ""}
                </p>
                {step.at ? (
                  <p className="mt-0.5 text-13 text-muted">{step.at}</p>
                ) : step.hint ? (
                  <p className="mt-0.5 text-13 text-muted">{step.hint}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
