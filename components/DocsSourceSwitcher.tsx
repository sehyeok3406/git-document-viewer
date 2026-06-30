"use client";

import { Check, ChevronDown, FolderGit2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { docsConfigId, getSavedDocsConfigs, saveSelectedDocsConfig } from "@/lib/config-store";
import type { SelectedDocsConfig } from "@/lib/types";

function sourceLabel(config: SelectedDocsConfig | null) {
  if (!config) return "문서 소스 선택";
  return config.repoFullName || `${config.owner}/${config.repo}`;
}

function sourceDetail(config: SelectedDocsConfig) {
  return `${config.branch} · ${config.docsPath || "/"}`;
}

export function DocsSourceSwitcher({
  currentConfig,
  onSelect,
}: {
  currentConfig: SelectedDocsConfig | null;
  onSelect?: (config: SelectedDocsConfig) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [configs, setConfigs] = useState<SelectedDocsConfig[]>([]);

  const currentId = currentConfig ? currentConfig.configId || docsConfigId(currentConfig) : "";

  useEffect(() => {
    setConfigs(getSavedDocsConfigs());
  }, []);

  useEffect(() => {
    if (!open) return;
    setConfigs(getSavedDocsConfigs());

    function closeOnPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    window.addEventListener("pointerdown", closeOnPointerDown);
    return () => window.removeEventListener("pointerdown", closeOnPointerDown);
  }, [open]);

  const filteredConfigs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return configs;
    return configs.filter((config) => {
      const target = `${sourceLabel(config)} ${sourceDetail(config)}`.toLowerCase();
      return target.includes(normalizedQuery);
    });
  }, [configs, query]);

  function selectConfig(config: SelectedDocsConfig) {
    saveSelectedDocsConfig({
      ...config,
      selectedAt: new Date().toISOString(),
    });
    setOpen(false);
    setQuery("");
    onSelect?.(config);
  }

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 max-w-[min(22rem,calc(100vw-6rem))] items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-left transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <FolderGit2 className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />
        <span className="min-w-0 truncate text-sm font-semibold">{sourceLabel(currentConfig)}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />
      </button>

      {open ? (
        <div className="absolute left-0 top-11 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
          <label className="flex h-11 items-center gap-2 border-b border-neutral-200 px-3 dark:border-neutral-800">
            <Search className="h-4 w-4 text-neutral-500" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
              placeholder="저장소 검색"
            />
          </label>

          <div className="max-h-80 overflow-y-auto p-1">
            {filteredConfigs.length > 0 ? (
              filteredConfigs.map((config) => {
                const configId = config.configId || docsConfigId(config);
                const selected = configId === currentId;
                return (
                  <button
                    key={configId}
                    type="button"
                    onClick={() => selectConfig(config)}
                    className="flex min-h-14 w-full items-center gap-3 rounded-md px-3 py-2 text-left transition hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  >
                    <FolderGit2 className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{sourceLabel(config)}</span>
                      <span className="block truncate text-xs text-neutral-500 dark:text-neutral-500">{sourceDetail(config)}</span>
                    </span>
                    {selected ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-5 text-sm text-neutral-500">저장된 문서 소스가 없습니다.</div>
            )}
          </div>

          <div className="border-t border-neutral-200 p-1 dark:border-neutral-800">
            <Link
              href="/api/github/login"
              className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              <Plus className="h-4 w-4" aria-hidden />
              문서 저장소 추가
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
