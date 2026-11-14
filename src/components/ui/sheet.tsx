"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  side?: "right" | "bottom";
  size?: "md" | "lg";
  className?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function Sheet({
  open,
  onClose,
  title,
  description,
  side = "right",
  size = "md",
  className,
  footer,
  children,
}: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-0 max-h-none border-0 bg-transparent p-0 text-ink",
        side === "right"
          ? cn("ml-auto h-dvh w-full", size === "lg" ? "max-w-xl" : "max-w-md")
          : "inset-x-0 bottom-0 top-auto mx-auto h-auto max-h-[85dvh] w-full max-w-xl",
      )}
    >
      <div
        className={cn(
          "flex flex-col border-ink bg-paper",
          side === "right" ? "h-dvh border-l" : "max-h-[85dvh] border-t",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b-2 border-ink px-5 py-4">
          <div className="min-w-0">
            <h2 className="screen-title text-2xl">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-rule text-ink-2 transition-[background-color,border-color,color] duration-[var(--dur-micro)] hover:border-ink hover:bg-paper-2 hover:text-ink active:translate-y-px"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer ? (
          <div className="border-t border-rule bg-paper-2 px-5 py-4">{footer}</div>
        ) : null}
      </div>
    </dialog>
  );
}
