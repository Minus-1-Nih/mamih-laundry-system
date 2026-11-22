import type { ReactNode } from "react";

export function DriverShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper font-driver sm:py-6">
      <div className="mx-auto min-h-dvh w-full max-w-md overflow-hidden bg-paper sm:min-h-0 sm:rounded-card sm:border sm:border-rule sm:shadow-card">
        {children}
      </div>
    </div>
  );
}
