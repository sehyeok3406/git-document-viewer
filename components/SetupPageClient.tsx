"use client";

import { useSearchParams } from "next/navigation";

import { ErrorState } from "@/components/ErrorState";
import { GithubConnectButton } from "@/components/GithubConnectButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SetupPageClient() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="font-semibold">git-document-viewer 설정</div>
        <ThemeToggle />
      </header>
      <section className="mx-auto max-w-2xl px-4 py-10">
        {error ? <ErrorState message="GitHub App 설치 정보가 돌아오지 않았습니다. 다시 연결해주세요." /> : null}
        <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
          <h1 className="text-2xl font-semibold">GitHub 연결이 필요합니다</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            개인 GitHub 계정에 GitHub App을 설치하면 읽기 권한이 있는 저장소 목록을 가져올 수 있습니다.
          </p>
          <div className="mt-5">
            <GithubConnectButton />
          </div>
        </div>
      </section>
    </main>
  );
}
