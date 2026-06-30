"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { GithubConnectButton } from "@/components/GithubConnectButton";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { configParams, fetchJson } from "@/lib/client-api";
import { getSelectedDocsConfig } from "@/lib/config-store";
import { findDocBySlug } from "@/lib/docs-tree";
import { extractTitle, extractToc } from "@/lib/markdown";
import { docHref } from "@/lib/routes";
import type { DocTreePayload, SelectedDocsConfig } from "@/lib/types";

export function DocsClient({ initialSlug }: { initialSlug: string }) {
  const router = useRouter();
  const [config, setConfig] = useState<SelectedDocsConfig | null>(null);
  const [tree, setTree] = useState<DocTreePayload | null>(null);
  const [content, setContent] = useState("");
  const [treeLoading, setTreeLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setConfig(getSelectedDocsConfig());
  }, []);

  useEffect(() => {
    if (!config) return;
    setTreeLoading(true);
    setError(null);
    fetchJson<DocTreePayload>("/api/github/tree", configParams(config))
      .then((data) => setTree(data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "문서 트리를 불러오지 못했습니다."))
      .finally(() => setTreeLoading(false));
  }, [config]);

  const currentDoc = useMemo(() => {
    if (!tree) return undefined;
    return findDocBySlug(tree.docs, initialSlug);
  }, [initialSlug, tree]);

  useEffect(() => {
    if (!config || !currentDoc?.path) return;
    if (!initialSlug && currentDoc.slug) router.replace(docHref(currentDoc.slug));
    setFileLoading(true);
    setError(null);
    fetchJson<{ content: string }>("/api/github/file", {
      ...configParams(config),
      path: currentDoc.path,
    })
      .then((data) => setContent(data.content))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "문서를 불러오지 못했습니다."))
      .finally(() => setFileLoading(false));
  }, [config, currentDoc, initialSlug, router]);

  const title = content && currentDoc ? extractTitle(content, currentDoc.displayName) : currentDoc?.displayName ?? "문서";
  const toc = useMemo(() => extractToc(content), [content]);

  function switchConfig(nextConfig: SelectedDocsConfig) {
    setConfig(nextConfig);
    setTree(null);
    setContent("");
    setError(null);
    router.push("/docs");
  }

  if (!config) {
    return (
      <main className="min-h-screen bg-neutral-50 p-4 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
        <EmptyState title="문서 설정이 없습니다" description="GitHub App을 연결하고 저장소와 문서 폴더를 먼저 선택해주세요." action={<GithubConnectButton />} />
      </main>
    );
  }

  if (treeLoading || !tree) {
    return (
      <main className="min-h-screen bg-neutral-50 p-4 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
        <div className="mx-auto max-w-3xl rounded-lg border border-neutral-200 bg-white p-6 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
          문서 트리를 불러오는 중입니다.
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-50 p-4 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
        <div className="mx-auto max-w-3xl">
          <ErrorState message={error} />
        </div>
      </main>
    );
  }

  if (tree.docs.length === 0 || !currentDoc) {
    return (
      <main className="min-h-screen bg-neutral-50 p-4 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
        <EmptyState title="Markdown 문서가 없습니다" description="선택한 문서 폴더에 .md 파일이 있는지 확인해주세요." />
      </main>
    );
  }

  return (
    <AppShell
      config={config}
      root={tree.root}
      currentPath={currentDoc.path}
      currentTitle={title}
      toc={toc}
      onConfigChange={switchConfig}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 border-b border-neutral-200 pb-4 dark:border-neutral-800">
          <p className="break-all text-xs text-neutral-500 dark:text-neutral-500">
            {config.branch} · {currentDoc.path}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        </div>
        {fileLoading ? (
          <p className="text-sm text-neutral-500">문서를 불러오는 중입니다.</p>
        ) : (
          <MarkdownViewer
            content={content}
            currentPath={currentDoc.path}
            docs={tree.docs}
            assets={tree.assets}
            config={config}
          />
        )}
      </div>
    </AppShell>
  );
}
