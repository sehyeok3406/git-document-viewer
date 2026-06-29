import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-950">
      <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-neutral-600 dark:text-neutral-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
