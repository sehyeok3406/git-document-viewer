import { basename, dirname, joinRepoPath, normalizeRepoPath } from "@/lib/paths";
import type { DocAsset, DocNode } from "@/lib/types";

export function transformObsidianSyntax(markdown: string) {
  return markdown
    .replace(/!\[\[([^\]]+)]]/g, (_, target: string) => {
      const cleanTarget = target.trim();
      return `![${cleanTarget}](obsidian-image:${encodeURIComponent(cleanTarget)})`;
    })
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?]]/g, (_, target: string, label?: string) => {
      const cleanTarget = target.trim();
      const cleanLabel = (label || target).trim();
      return `[${cleanLabel}](obsidian-doc:${encodeURIComponent(cleanTarget)})`;
    })
    .replace(/(^|[\s(])#([\p{L}\p{N}_/-]+)/gu, (_match, prefix: string, tag: string) => {
      return `${prefix}[#${tag}](obsidian-tag:${encodeURIComponent(tag)})`;
    });
}

function normalizeDocLookupName(value: string) {
  return value
    .replace(/\.md$/i, "")
    .replace(/\\/g, "/")
    .toLowerCase()
    .trim();
}

export function resolveWikiDoc(target: string, docs: DocNode[]) {
  const cleanTarget = normalizeDocLookupName(target);
  const direct = docs.find((doc) => normalizeDocLookupName(doc.path) === cleanTarget);
  if (direct) return direct;

  return docs.find((doc) => {
    const pathWithoutExtension = normalizeDocLookupName(doc.path);
    const fileWithoutExtension = normalizeDocLookupName(basename(doc.path));
    return pathWithoutExtension.endsWith(`/${cleanTarget}`) || fileWithoutExtension === cleanTarget;
  });
}

export function resolveRelativeMarkdownLink(target: string, currentPath: string, docs: DocNode[]) {
  if (!target.toLowerCase().endsWith(".md")) return undefined;
  const absoluteTarget = target.startsWith("/")
    ? normalizeRepoPath(target.slice(1))
    : joinRepoPath(dirname(currentPath), target);
  return docs.find((doc) => normalizeDocLookupName(doc.path) === normalizeDocLookupName(absoluteTarget));
}

export function resolveAsset(target: string, currentPath: string, assets: DocAsset[]) {
  const cleanTarget = target.replace(/^\.?\//, "").trim();
  const relativeToCurrent = joinRepoPath(dirname(currentPath), cleanTarget);
  const byRelativePath = assets.find((asset) => asset.path === relativeToCurrent);
  if (byRelativePath) return byRelativePath;

  const byPath = assets.find((asset) => asset.path.endsWith(cleanTarget));
  if (byPath) return byPath;

  return assets.find((asset) => asset.name.toLowerCase() === cleanTarget.toLowerCase());
}
