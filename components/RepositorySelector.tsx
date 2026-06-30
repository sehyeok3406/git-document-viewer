"use client";

import { Lock, Search, Unlock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ErrorState } from "@/components/ErrorState";
import { fetchJson } from "@/lib/client-api";
import type { RepositorySummary } from "@/lib/types";

export function RepositorySelector({
  installationIds,
  onSelect,
}: {
  installationIds: string[];
  onSelect: (repository: RepositorySummary) => void;
}) {
  const [repositories, setRepositories] = useState<RepositorySummary[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const installationIdsKey = installationIds.join(",");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    fetchJson<{ repositories: RepositorySummary[] }>("/api/github/repositories", { installationIds: installationIdsKey })
      .then((data) => {
        if (!ignore) setRepositories(data.repositories);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof Error ? err.message : "저장소 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [installationIdsKey]);

  const filteredRepositories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return repositories;
    return repositories.filter((repository) => repository.fullName.toLowerCase().includes(normalizedQuery));
  }, [query, repositories]);

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-4">
      <label className="flex h-11 items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 dark:border-neutral-800 dark:bg-neutral-950">
        <Search className="h-4 w-4 text-neutral-500" aria-hidden />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
          placeholder="저장소 이름 검색"
        />
      </label>

      {loading ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-5 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
          저장소를 불러오는 중입니다.
        </div>
      ) : null}

      {!loading && filteredRepositories.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-5 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
          접근 가능한 저장소가 없습니다. GitHub App 설치 범위에 저장소가 포함되어 있는지 확인해주세요.
        </div>
      ) : null}

      <div className="grid gap-3">
        {filteredRepositories.map((repository) => (
          <button
            key={repository.id}
            type="button"
            onClick={() => onSelect(repository)}
            className="rounded-lg border border-neutral-200 bg-white p-4 text-left transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-600 dark:hover:bg-neutral-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold text-neutral-950 dark:text-neutral-50">{repository.fullName}</div>
                {repository.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{repository.description}</p>
                ) : null}
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                {repository.private ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                {repository.private ? "private" : "public"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-500">
              <span>기본 브랜치: {repository.defaultBranch}</span>
              <span>업데이트: {repository.updatedAt ? new Date(repository.updatedAt).toLocaleString("ko-KR") : "-"}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
