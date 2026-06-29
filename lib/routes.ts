import { encodeParams } from "@/lib/paths";
import type { SelectedDocsConfig } from "@/lib/types";

export function docHref(slug: string) {
  const encodedSlug = slug
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return encodedSlug ? `/docs/${encodedSlug}` : "/docs";
}

export function fileApiUrl(config: SelectedDocsConfig, path: string, raw = false) {
  return `/api/github/file?${encodeParams({
    installationId: config.installationId,
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
    path,
    raw: raw ? "1" : undefined,
  })}`;
}
