"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { GithubConnectButton } from "@/components/GithubConnectButton";
import { RepositorySelector } from "@/components/RepositorySelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSetupDraft, saveSetupDraft } from "@/lib/config-store";
import type { RepositorySummary } from "@/lib/types";

export function RepositoriesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [installationIds, setInstallationIds] = useState<string[]>([]);

  useEffect(() => {
    const draft = getSetupDraft();
    const idsFromQuery = searchParams
      .get("installationIds")
      ?.split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    const singleId = searchParams.get("installationId") || draft.installationId;
    const ids = idsFromQuery?.length ? idsFromQuery : draft.installationIds?.length ? draft.installationIds : singleId ? [singleId] : [];

    setInstallationIds(ids);
    if (ids.length > 0) saveSetupDraft({ installationId: ids[0], installationIds: ids });
  }, [searchParams]);

  function selectRepository(repository: RepositorySummary) {
    saveSetupDraft({
      installationId: repository.installationId,
      installationIds,
      owner: repository.owner,
      repo: repository.name,
      branch: repository.defaultBranch,
      defaultBranch: repository.defaultBranch,
      repoFullName: repository.fullName,
      private: repository.private,
      docsPath: "",
    });
    router.push("/setup/folder");
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="font-semibold">저장소 선택</div>
        <ThemeToggle />
      </header>
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">문서가 들어 있는 저장소를 선택하세요</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            저장소를 선택하면 다음 단계에서 Markdown 문서가 들어 있는 폴더를 문서 루트로 지정할 수 있습니다.
          </p>
        </div>
        {installationIds.length > 0 ? (
          <RepositorySelector installationIds={installationIds} onSelect={selectRepository} />
        ) : (
          <EmptyState title="GitHub App 설치 정보가 없습니다" description="먼저 GitHub App을 설치하고 돌아와야 합니다." action={<GithubConnectButton />} />
        )}
      </section>
    </main>
  );
}
