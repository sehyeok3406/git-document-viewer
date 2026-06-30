"use client";

import { BookOpen, FolderGit2, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { DocsSourceSwitcher } from "@/components/DocsSourceSwitcher";
import { GithubConnectButton } from "@/components/GithubConnectButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSelectedDocsConfig } from "@/lib/config-store";
import type { SelectedDocsConfig } from "@/lib/types";

export function HomeClient() {
  const [config, setConfig] = useState<SelectedDocsConfig | null>(null);

  useEffect(() => {
    setConfig(getSelectedDocsConfig());
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5" aria-hidden />
          git-document-viewer
        </div>
        <ThemeToggle />
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl flex-col justify-center px-4 py-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">GitHub Markdown docs viewer</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">GitHub Markdown 문서를 편하게 읽는 뷰어</h1>
          <p className="mt-5 text-base leading-7 text-neutral-600 dark:text-neutral-400">
            GitHub 저장소의 특정 폴더를 문서 루트로 선택하고, Markdown과 Obsidian 링크를 모바일/PC에서 읽기 좋게 보여줍니다.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {config ? (
            <>
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
            </>
          ) : (
            <GithubConnectButton />
          )}
        </div>

        {config ? (
          <div className="mt-8 max-w-2xl rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-start gap-3">
              <FolderGit2 className="mt-0.5 h-5 w-5 text-neutral-500" aria-hidden />
              <div className="min-w-0 flex-1">
                <DocsSourceSwitcher currentConfig={config} onSelect={setConfig} />
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {config.branch} · {config.docsPath || "/"}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
