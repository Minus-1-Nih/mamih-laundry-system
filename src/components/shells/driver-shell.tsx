import type { ReactNode } from "react";

export function DriverShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper-2 font-driver sm:py-8">
      <div className="mx-auto min-h-dvh w-full max-w-[412px] border-ink bg-paper sm:min-h-0 sm:border-2 sm:shadow-[10px_10px_0_var(--color-paper-3)]">
        {children}
      </div>
    </div>
  );
}
