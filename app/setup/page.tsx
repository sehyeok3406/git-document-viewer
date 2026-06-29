import { Suspense } from "react";

import { SetupPageClient } from "@/components/SetupPageClient";

export default function SetupPage() {
  return (
    <Suspense>
      <SetupPageClient />
    </Suspense>
  );
}
