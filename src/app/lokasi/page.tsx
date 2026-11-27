import { Suspense } from "react";
import { LocationClient } from "@/components/customer/location-client";
import { PublicShell } from "@/components/shells/public-shell";

export default function LocationPage() {
  return (
    <PublicShell>
      <Suspense fallback={null}>
        <LocationClient />
      </Suspense>
    </PublicShell>
  );
}
