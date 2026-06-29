"use client";

import clsx from "clsx";

import type { TocItem } from "@/lib/types";

export function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-500">목차가 없습니다.</p>;
  }

  return (
    <nav className="space-y-1" aria-label="문서 목차">
      {items.map((item) => (
        <a
          key={`${item.id}-${item.text}`}
          href={`#${item.id}`}
          className={clsx(
            "block rounded-md py-1 text-sm text-neutral-600 transition hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100",
            item.level === 2 && "pl-3",
            item.level === 3 && "pl-6 text-xs",
          )}
        >
          {item.text}
        </a>
      ))}
    </nav>
  );
}
