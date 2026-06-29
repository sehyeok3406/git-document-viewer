const UNSAFE_SEGMENTS = new Set(["..", "."]);

export function normalizeRepoPath(path = "") {
  const normalized = decodeURIComponent(path)
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .join("/");

  const segments = normalized.split("/").filter(Boolean);
  if (segments.some((segment) => UNSAFE_SEGMENTS.has(segment))) {
    throw new Error("Invalid path");
  }

  return normalized;
}

export function joinRepoPath(...parts: Array<string | undefined | null>) {
  return normalizeRepoPath(parts.filter(Boolean).join("/"));
}

export function dirname(path: string) {
  const safePath = normalizeRepoPath(path);
  const parts = safePath.split("/");
  parts.pop();
  return parts.join("/");
}

export function basename(path: string) {
  return normalizeRepoPath(path).split("/").pop() ?? "";
}

export function stripMarkdownExtension(path: string) {
  return path.replace(/\.md$/i, "");
}

export function pathToSlug(path: string) {
  return stripMarkdownExtension(normalizeRepoPath(path));
}

export function slugToMarkdownPath(slug: string) {
  const safeSlug = normalizeRepoPath(slug);
  return safeSlug.toLowerCase().endsWith(".md") ? safeSlug : `${safeSlug}.md`;
}

export function displayNameFromPath(path: string) {
  const fileName = basename(path).replace(/\.md$/i, "");
  return fileName
    .replace(/^\d+[_\-\s]*/, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

function numericPrefix(name: string) {
  const match = name.match(/^(\d+)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

export function compareByDocName(a: { name: string }, b: { name: string }) {
  const aPrefix = numericPrefix(a.name);
  const bPrefix = numericPrefix(b.name);
  if (aPrefix !== bPrefix) return aPrefix - bPrefix;
  return a.name.localeCompare(b.name, "ko", { numeric: true, sensitivity: "base" });
}

export function encodeParams(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  return query.toString();
}
