"use client";

import { Check, FolderGit2, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { GithubConnectButton } from "@/components/GithubConnectButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  clearSelectedDocsConfig,
  docsConfigId,
  getSavedDocsConfigs,
  getSelectedDocsConfig,
  removeSavedDocsConfig,
  saveSelectedDocsConfig,
} from "@/lib/config-store";
import type { SelectedDocsConfig } from "@/lib/types";

export function SettingsPageClient() {
  const [config, setConfig] = useState<SelectedDocsConfig | null>(null);
  const [configs, setConfigs] = useState<SelectedDocsConfig[]>([]);

  useEffect(() => {
    setConfig(getSelectedDocsConfig());
    setConfigs(getSavedDocsConfigs());
  }, []);

  function clearConfig() {
    if (!window.confirm("저장된 문서 소스를 모두 삭제할까요?")) return;
    clearSelectedDocsConfig();
    setConfig(null);
    setConfigs([]);
  }

  function selectConfig(nextConfig: SelectedDocsConfig) {
    saveSelectedDocsConfig({
      ...nextConfig,
      selectedAt: new Date().toISOString(),
    });
    setConfig(getSelectedDocsConfig());
    setConfigs(getSavedDocsConfigs());
  }

  function removeConfig(configId: string) {
    removeSavedDocsConfig(configId);
    setConfig(getSelectedDocsConfig());
    setConfigs(getSavedDocsConfigs());
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="font-semibold">설정</div>
        <ThemeToggle />
      </header>
      <section className="mx-auto max-w-2xl px-4 py-10">
        {config ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
            <h1 className="text-2xl font-semibold">현재 문서 설정</h1>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="grid gap-1">
                <dt className="font-semibold text-neutral-500">저장소</dt>
                <dd className="break-all">{config.owner}/{config.repo}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-semibold text-neutral-500">브랜치</dt>
                <dd>{config.branch}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-semibold text-neutral-500">문서 폴더</dt>
                <dd className="break-all">{config.docsPath || "/"}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/api/github/login"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-neutral-200 px-4 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                저장소 다시 선택
              </Link>
              <button
                type="button"
                onClick={clearConfig}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-200 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-950 dark:text-red-300 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                전체 초기화
              </button>
            </div>
          </div>
        ) : (
          <EmptyState title="저장된 설정이 없습니다" description="문서 저장소를 먼저 연결해주세요." action={<GithubConnectButton />} />
        )}

        {configs.length > 0 ? (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-neutral-500">저장된 문서 소스</h2>
            <div className="mt-3 grid gap-2">
              {configs.map((savedConfig) => {
                const savedConfigId = savedConfig.configId || docsConfigId(savedConfig);
                const selected = savedConfigId === config?.configId;
                return (
                  <div
                    key={savedConfigId}
                    className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <FolderGit2 className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{savedConfig.repoFullName || `${savedConfig.owner}/${savedConfig.repo}`}</div>
                      <div className="truncate text-xs text-neutral-500 dark:text-neutral-500">
                        {savedConfig.branch} · {savedConfig.docsPath || "/"}
                      </div>
                    </div>
                    {selected ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
                    <button
                      type="button"
                      onClick={() => selectConfig(savedConfig)}
                      className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-200 px-3 text-sm font-semibold transition hover:bg-neutral-100 disabled:cursor-default disabled:opacity-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                      disabled={selected}
                    >
                      선택
                    </button>
                    <button
                      type="button"
                      onClick={() => removeConfig(savedConfigId)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 dark:border-red-950 dark:text-red-300 dark:hover:bg-red-950/30"
                      aria-label="문서 소스 삭제"
                      title="문서 소스 삭제"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
