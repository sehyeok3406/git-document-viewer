"use client";

import { BookOpen, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { GithubConnectButton } from "@/components/GithubConnectButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSelectedDocsConfig } from "@/lib/config-store";
import type { SelectedDocsConfig } from "@/lib/types";

export function CompletePageClient() {
  const [config, setConfig] = useState<SelectedDocsConfig | null>(null);

  useEffect(() => {
    setConfig(getSelectedDocsConfig());
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="font-semibold">설정 완료</div>
        <ThemeToggle />
      </header>
      <section className="mx-auto max-w-2xl px-4 py-10">
        {config ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
            <h1 className="text-2xl font-semibold">문서 뷰어 준비가 끝났습니다</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              {config.owner}/{config.repo} 저장소의 {config.docsPath || "/"} 폴더를 문서 루트로 사용합니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/docs"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                <BookOpen className="h-4 w-4" aria-hidden />
                문서 보기
              </Link>
              <Link
                href="/settings"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-neutral-200 px-4 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <Settings className="h-4 w-4" aria-hidden />
                설정 변경
              </Link>
            </div>
          </div>
        ) : (
          <EmptyState title="저장된 설정이 없습니다" description="GitHub App 연결부터 다시 진행해주세요." action={<GithubConnectButton />} />
        )}
      </section>
    </main>
  );
}
