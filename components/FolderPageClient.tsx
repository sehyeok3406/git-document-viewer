"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { BranchSelector } from "@/components/BranchSelector";
import { EmptyState } from "@/components/EmptyState";
import { FolderPicker } from "@/components/FolderPicker";
import { GithubConnectButton } from "@/components/GithubConnectButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSetupDraft, saveSelectedDocsConfig, saveSetupDraft } from "@/lib/config-store";
import type { SetupDraft } from "@/lib/types";

export function FolderPageClient() {
  const router = useRouter();
  const [draft, setDraft] = useState<SetupDraft | null>(null);
  const [branch, setBranchState] = useState("");
  const [docsPath, setDocsPath] = useState("");

  useEffect(() => {
    const currentDraft = getSetupDraft();
    setDraft(currentDraft);
    setBranchState(currentDraft.branch || currentDraft.defaultBranch || "main");
    setDocsPath(currentDraft.docsPath || "");
  }, []);

  const setBranch = useCallback((nextBranch: string) => {
    setBranchState(nextBranch);
  }, []);

  function completeSetup() {
    if (!draft?.installationId || !draft.owner || !draft.repo || !branch) return;
    const config = {
      installationId: draft.installationId,
      owner: draft.owner,
      repo: draft.repo,
      branch,
      docsPath,
      selectedAt: new Date().toISOString(),
      repoFullName: draft.repoFullName,
      private: draft.private,
    };
    saveSetupDraft(config);
    saveSelectedDocsConfig(config);
    router.push("/setup/complete");
  }

  if (!draft) return null;

  if (!draft.installationId || !draft.owner || !draft.repo) {
    return (
      <main className="min-h-screen bg-neutral-50 p-4 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
        <EmptyState title="저장소 선택이 필요합니다" description="GitHub App 설치 후 저장소를 먼저 선택해주세요." action={<GithubConnectButton />} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="font-semibold">문서 폴더 선택</div>
        <ThemeToggle />
      </header>
      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-semibold">{draft.owner}/{draft.repo}</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              브랜치를 고른 뒤 Markdown 문서가 들어 있는 폴더를 문서 루트로 선택하세요.
            </p>
          </div>
          <BranchSelector
            installationId={draft.installationId}
            owner={draft.owner}
            repo={draft.repo}
            value={branch}
            defaultBranch={draft.defaultBranch}
            onChange={setBranch}
          />
          <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" aria-hidden />
              <div>
                <div className="text-sm font-semibold">선택한 문서 폴더</div>
                <p className="mt-1 break-all text-sm text-neutral-600 dark:text-neutral-400">{docsPath || "/"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={completeSetup}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              설정 완료
            </button>
          </div>
        </div>
        <FolderPicker
          installationId={draft.installationId}
          owner={draft.owner}
          repo={draft.repo}
          branch={branch}
          initialPath={docsPath}
          onSelect={setDocsPath}
        />
      </section>
    </main>
  );
}
