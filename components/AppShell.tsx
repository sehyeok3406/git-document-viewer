"use client";

import { Menu, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { DocsSidebar } from "@/components/DocsSidebar";
import { DocsSourceSwitcher } from "@/components/DocsSourceSwitcher";
import { MarkdownSearch } from "@/components/MarkdownSearch";
import { MobileDocsDrawer } from "@/components/MobileDocsDrawer";
import { TableOfContents } from "@/components/TableOfContents";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { DocNode, SelectedDocsConfig, TocItem } from "@/lib/types";

export function AppShell({
  config,
  root,
  currentPath,
  currentTitle,
  toc,
  onConfigChange,
  children,
}: {
  config: SelectedDocsConfig;
  root: DocNode;
  currentPath?: string;
  currentTitle: string;
  toc: TocItem[];
  onConfigChange?: (config: SelectedDocsConfig) => void;
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-neutral-200 bg-white/95 px-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95 lg:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 lg:hidden"
            aria-label="문서 메뉴 열기"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <div className="min-w-0">
            <DocsSourceSwitcher
              currentConfig={config}
              onSelect={onConfigChange}
              panelPlacement="header"
              buttonClassName="h-9 max-w-[calc(100vw-11rem)] sm:max-w-[22rem]"
            />
            <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-500">{currentTitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden w-72 md:block">
            <MarkdownSearch config={config} />
          </div>
          <Link
            href="/settings"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900"
            aria-label="설정"
            title="설정"
          >
            <Settings className="h-4 w-4" aria-hidden />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <MobileDocsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        root={root}
        currentPath={currentPath}
        config={config}
      />

      <div className="mx-auto grid w-full max-w-[1680px] grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_260px]">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 lg:block">
          <div className="mb-4">
            <MarkdownSearch config={config} />
          </div>
          <DocsSidebar root={root} currentPath={currentPath} />
        </aside>
        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] overflow-y-auto border-l border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 xl:block">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">목차</h2>
          <TableOfContents items={toc} />
        </aside>
      </div>
    </div>
  );
}
