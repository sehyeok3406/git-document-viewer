"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { GithubConnectButton } from "@/components/GithubConnectButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { clearSelectedDocsConfig, getSelectedDocsConfig } from "@/lib/config-store";
import type { SelectedDocsConfig } from "@/lib/types";

export function SettingsPageClient() {
  const [config, setConfig] = useState<SelectedDocsConfig | null>(null);

  useEffect(() => {
    setConfig(getSelectedDocsConfig());
  }, []);

  function clearConfig() {
    clearSelectedDocsConfig();
    setConfig(null);
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
                href="/setup/repositories"
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
                설정 초기화
              </button>
            </div>
          </div>
        ) : (
          <EmptyState title="저장된 설정이 없습니다" description="문서 저장소를 먼저 연결해주세요." action={<GithubConnectButton />} />
        )}
      </section>
    </main>
  );
}
