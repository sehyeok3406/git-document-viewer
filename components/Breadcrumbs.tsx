import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs({ path }: { path: string }) {
  const segments = path.split("/").filter(Boolean);
  return (
    <nav className="flex min-w-0 items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400" aria-label="현재 경로">
      <Home className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {segments.map((segment) => (
        <span key={segment} className="flex min-w-0 items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{segment}</span>
        </span>
      ))}
    </nav>
  );
}
