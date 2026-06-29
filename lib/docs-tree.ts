import type { DocAsset, DocNode, DocTreePayload } from "@/lib/types";
import {
  compareByDocName,
  displayNameFromPath,
  normalizeRepoPath,
  pathToSlug,
} from "@/lib/paths";

export type GithubTreeItem = {
  path?: string;
  type?: string;
};

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"]);

function extensionFor(path: string) {
  const match = path.match(/\.[^.]+$/);
  return match?.[0].toLowerCase() ?? "";
}

function isHiddenPath(path: string) {
  return path.split("/").some((segment) => segment.startsWith("."));
}

function isMarkdown(path: string) {
  return path.toLowerCase().endsWith(".md");
}

function ensureFolder(parent: DocNode, name: string, path: string) {
  parent.children ??= [];
  const existing = parent.children.find((node) => node.type === "folder" && node.name === name);
  if (existing) return existing;

  const folder: DocNode = {
    type: "folder",
    name,
    path,
    displayName: displayNameFromPath(name),
    children: [],
  };
  parent.children.push(folder);
  return folder;
}

function sortNode(node: DocNode) {
  if (!node.children) return node;
  node.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return compareByDocName(a, b);
  });
  node.children.forEach(sortNode);
  return node;
}

export function flattenDocs(node: DocNode): DocNode[] {
  const docs: DocNode[] = [];
  const visit = (current: DocNode) => {
    if (current.type === "file") docs.push(current);
    current.children?.forEach(visit);
  };
  visit(node);
  return docs;
}

export function buildDocsTreeFromGitTree(items: GithubTreeItem[], docsPath: string): DocTreePayload {
  const normalizedDocsPath = normalizeRepoPath(docsPath);
  const prefix = normalizedDocsPath ? `${normalizedDocsPath}/` : "";
  const rootName = normalizedDocsPath.split("/").pop() || "Documents";
  const root: DocNode = {
    type: "folder",
    name: rootName,
    path: normalizedDocsPath,
    displayName: displayNameFromPath(rootName),
    children: [],
  };
  const assets: DocAsset[] = [];

  for (const item of items) {
    if (!item.path || item.type !== "blob") continue;
    const safePath = normalizeRepoPath(item.path);
    if (normalizedDocsPath && safePath !== normalizedDocsPath && !safePath.startsWith(prefix)) continue;
    if (isHiddenPath(safePath)) continue;

    const ext = extensionFor(safePath);
    if (IMAGE_EXTENSIONS.has(ext)) {
      assets.push({
        name: safePath.split("/").pop() ?? safePath,
        path: safePath,
        extension: ext.slice(1),
      });
    }

    if (!isMarkdown(safePath)) continue;

    const relativePath = normalizedDocsPath ? safePath.slice(prefix.length) : safePath;
    const segments = relativePath.split("/").filter(Boolean);
    let cursor = root;

    segments.forEach((segment, index) => {
      const currentPath = [normalizedDocsPath, ...segments.slice(0, index + 1)].filter(Boolean).join("/");
      if (index === segments.length - 1) {
        cursor.children ??= [];
        cursor.children.push({
          type: "file",
          name: segment,
          path: safePath,
          displayName: displayNameFromPath(segment),
          slug: pathToSlug(safePath),
        });
      } else {
        cursor = ensureFolder(cursor, segment, currentPath);
      }
    });
  }

  sortNode(root);
  assets.sort(compareByDocName);

  return {
    root,
    docs: flattenDocs(root),
    assets,
  };
}

export function findDocBySlug(docs: DocNode[], slug?: string) {
  if (!slug) return docs[0];
  const normalizedSlug = normalizeRepoPath(slug);
  return docs.find((doc) => doc.slug === normalizedSlug) ?? docs[0];
}
