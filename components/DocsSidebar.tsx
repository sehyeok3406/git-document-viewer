"use client";

import clsx from "clsx";
import { FileText, Folder } from "lucide-react";
import Link from "next/link";

import { docHref } from "@/lib/routes";
import type { DocNode } from "@/lib/types";

function TreeNode({
  node,
  currentPath,
  onNavigate,
}: {
  node: DocNode;
  currentPath?: string;
  onNavigate?: () => void;
}) {
  if (node.type === "file") {
    const active = node.path === currentPath;
    return (
      <Link
        href={docHref(node.slug ?? "")}
        onClick={onNavigate}
        className={clsx(
          "flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition",
          active
            ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
            : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900",
        )}
      >
        <FileText className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">{node.displayName}</span>
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex min-w-0 items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
        <Folder className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
        <span className="truncate">{node.displayName}</span>
      </div>
      <div className="ml-3 space-y-1 border-l border-neutral-200 pl-2 dark:border-neutral-800">
        {node.children?.map((child) => (
          <TreeNode key={child.path} node={child} currentPath={currentPath} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

export function DocsSidebar({
  root,
  currentPath,
  onNavigate,
}: {
  root: DocNode;
  currentPath?: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-2" aria-label="문서 목록">
      {root.children?.map((node) => (
        <TreeNode key={node.path} node={node} currentPath={currentPath} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}
