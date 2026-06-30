"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { configParams, fetchJson } from "@/lib/client-api";
import { docHref } from "@/lib/routes";
import { searchDocuments } from "@/lib/search";
import type { MarkdownIndexItem, SelectedDocsConfig } from "@/lib/types";

export function MarkdownSearch({
  config,
  onSelect,
}: {
  config: SelectedDocsConfig;
  onSelect?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<MarkdownIndexItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configKey = config.configId || `${config.installationId}:${config.owner}/${config.repo}:${config.branch}:${config.docsPath}`;

  useEffect(() => {
    setQuery("");
    setIndex([]);
    setLoading(false);
    setLoaded(false);
    setError(null);
  }, [configKey]);

  useEffect(() => {
    if (!query.trim() || loaded || loading) return;
    setLoading(true);
    fetchJson<{ index: MarkdownIndexItem[] }>("/api/github/markdown-index", configParams(config))
      .then((data) => {
        setIndex(data.index);
        setLoaded(true);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "검색 인덱스를 만들지 못했습니다."))
      .finally(() => setLoading(false));
  }, [config, loaded, loading, query]);

  const results = useMemo(() => searchDocuments(index, query).slice(0, 8), [index, query]);

  return (
    <div className="relative">
      <label className="flex h-10 items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 dark:border-neutral-800 dark:bg-neutral-950">
        <Search className="h-4 w-4 text-neutral-500" aria-hidden />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
          placeholder="문서 검색"
        />
      </label>
      {query.trim() ? (
        <div className="absolute left-0 right-0 top-12 z-20 max-h-96 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
          {loading ? <p className="px-3 py-2 text-sm text-neutral-500">검색 인덱스를 만드는 중입니다.</p> : null}
          {error ? <p className="px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p> : null}
          {!loading && !error && loaded && results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-neutral-500">검색 결과가 없습니다.</p>
          ) : null}
          {results.map((result) => (
            <Link
              key={result.path}
              href={docHref(result.slug)}
              className="block rounded-md px-3 py-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-900"
              onClick={() => {
                setQuery("");
                onSelect?.();
              }}
            >
              <div className="truncate text-sm font-semibold text-neutral-950 dark:text-neutral-50">{result.title}</div>
              <div className="truncate text-xs text-neutral-500 dark:text-neutral-500">{result.path}</div>
              {result.excerpt ? (
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-600 dark:text-neutral-400">
                  {result.excerpt}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
