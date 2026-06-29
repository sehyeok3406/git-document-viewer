"use client";

import { X } from "lucide-react";

import { DocsSidebar } from "@/components/DocsSidebar";
import { MarkdownSearch } from "@/components/MarkdownSearch";
import type { DocNode, SelectedDocsConfig } from "@/lib/types";

export function MobileDocsDrawer({
  open,
  onClose,
  root,
  currentPath,
  config,
}: {
  open: boolean;
  onClose: () => void;
  root: DocNode;
  currentPath?: string;
  config: SelectedDocsConfig;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="문서 메뉴 닫기"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 left-0 flex w-[min(88vw,360px)] flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800">
          <span className="font-semibold">문서</span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900"
            aria-label="닫기"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="border-b border-neutral-200 p-3 dark:border-neutral-800">
          <MarkdownSearch config={config} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <DocsSidebar root={root} currentPath={currentPath} />
        </div>
      </aside>
    </div>
  );
}
