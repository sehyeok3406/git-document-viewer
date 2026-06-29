"use client";

import { ChevronLeft, FileText, Folder, FolderCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { fetchJson } from "@/lib/client-api";
import { dirname } from "@/lib/paths";
import type { GithubContentItem } from "@/lib/types";

const RECOMMENDED_FOLDERS = new Set(["docs", "documents", "planning", "obsidian", "project-rc_docs", "기획서"]);

export function FolderPicker({
  installationId,
  owner,
  repo,
  branch,
  initialPath = "",
  onSelect,
}: {
  installationId: string;
  owner: string;
  repo: string;
  branch: string;
  initialPath?: string;
  onSelect: (path: string) => void;
}) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [contents, setContents] = useState<GithubContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContents = useCallback((path: string) => {
    if (!branch) return;
    setLoading(true);
    setError(null);
    fetchJson<{ contents: GithubContentItem[] }>("/api/github/contents", {
      installationId,
      owner,
      repo,
      branch,
      path,
    })
      .then((data) => setContents(data.contents))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "폴더를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [branch, installationId, owner, repo]);

  useEffect(() => {
    setCurrentPath(initialPath);
  }, [initialPath]);

  useEffect(() => {
    loadContents(currentPath);
  }, [currentPath, loadContents]);

  const markdownCount = useMemo(() => contents.filter((item) => item.type === "file" && item.name.endsWith(".md")).length, [contents]);
  const folders = contents.filter((item) => item.type === "dir");
  const files = contents.filter((item) => item.type === "file");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs path={currentPath || "/"} />
          <button
            type="button"
            onClick={() => onSelect(currentPath)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-neutral-950 px-3 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            <FolderCheck className="h-4 w-4" aria-hidden />
            이 폴더 선택
          </button>
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          현재 폴더의 Markdown 파일 {markdownCount}개. 하위 폴더까지 포함한 전체 문서 수는 선택 후 자동 계산됩니다.
        </div>
      </div>

      {currentPath ? (
        <button
          type="button"
          onClick={() => setCurrentPath(dirname(currentPath))}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-neutral-200 px-3 text-sm text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          상위 폴더
        </button>
      ) : null}

      {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}
      {loading ? <p className="text-sm text-neutral-500">폴더 내용을 불러오는 중입니다.</p> : null}

      <div className="grid gap-2">
        {folders.map((item) => {
          const recommended = RECOMMENDED_FOLDERS.has(item.name.toLowerCase());
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => setCurrentPath(item.path)}
              className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white px-3 py-3 text-left transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-600 dark:hover:bg-neutral-900"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Folder className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                <span className="truncate text-sm font-medium">{item.name}</span>
              </span>
              {recommended ? (
                <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-1 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                  추천
                </span>
              ) : null}
            </button>
          );
        })}
        {files.map((item) => (
          <div
            key={item.path}
            className="flex min-w-0 items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400"
          >
            <FileText className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
