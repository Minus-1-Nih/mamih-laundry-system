import type { ReactNode } from "react";

export function DriverShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas font-driver sm:py-6">
      <div className="mx-auto min-h-dvh w-full max-w-[412px] bg-surface sm:min-h-0 sm:rounded-2xl sm:border sm:border-border sm:shadow-sm">
        {children}
      </div>
    </div>
  );
}
