"use client";

import { GitBranch } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchJson } from "@/lib/client-api";
import type { BranchSummary } from "@/lib/types";

export function BranchSelector({
  installationId,
  owner,
  repo,
  value,
  defaultBranch,
  onChange,
}: {
  installationId: string;
  owner: string;
  repo: string;
  value: string;
  defaultBranch?: string;
  onChange: (branch: string) => void;
}) {
  const [branches, setBranches] = useState<BranchSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    fetchJson<{ branches: BranchSummary[] }>("/api/github/branches", { installationId, owner, repo })
      .then((data) => {
        if (ignore) return;
        setBranches(data.branches);
        const initial = value || defaultBranch || data.branches[0]?.name;
        if (initial) onChange(initial);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof Error ? err.message : "브랜치를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [defaultBranch, installationId, onChange, owner, repo, value]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">브랜치</label>
      <div className="flex h-11 items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 dark:border-neutral-800 dark:bg-neutral-950">
        <GitBranch className="h-4 w-4 text-neutral-500" aria-hidden />
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={loading || Boolean(error)}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        >
          {branches.map((branch) => (
            <option key={branch.name} value={branch.name}>
              {branch.name}
              {branch.name === defaultBranch ? " (default)" : ""}
            </option>
          ))}
        </select>
      </div>
      {loading ? <p className="text-xs text-neutral-500">브랜치 목록을 불러오는 중입니다.</p> : null}
      {error ? <p className="text-xs text-red-600 dark:text-red-300">{error}</p> : null}
    </div>
  );
}
