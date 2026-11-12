import { LocationClient } from "@/components/customer/location-client";
import { PublicShell } from "@/components/shells/public-shell";

export default function LocationPage() {
  return (
    <PublicShell>
      <LocationClient />
    </PublicShell>
  );
}
