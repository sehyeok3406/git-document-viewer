"use client";

import { encodeParams } from "@/lib/paths";
import type { SelectedDocsConfig } from "@/lib/types";

export async function fetchJson<T>(pathname: string, params: Record<string, string | undefined>) {
  const query = encodeParams(params);
  const response = await fetch(`${pathname}?${query}`, {
    cache: "no-store",
  });
  const data = (await response.json().catch(() => null)) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data?.error || `Request failed: ${response.status}`);
  }
  return data;
}

export function configParams(config: SelectedDocsConfig) {
  return {
    installationId: config.installationId,
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
    docsPath: config.docsPath,
  };
}
