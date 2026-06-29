import { Suspense } from "react";

import { RepositoriesPageClient } from "@/components/RepositoriesPageClient";

export default function RepositoriesPage() {
  return (
    <Suspense>
      <RepositoriesPageClient />
    </Suspense>
  );
}
