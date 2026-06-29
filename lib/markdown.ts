import type { TocItem } from "@/lib/types";

function slugifyHeading(text: string, counts: Map<string, number>) {
  const base =
    text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s_-]/gu, "")
      .replace(/\s+/g, "-") || "section";
  const count = counts.get(base) ?? 0;
  counts.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

export function extractTitle(markdown: string, fallback: string) {
  const heading = markdown.match(/^#\s+(.+)$/m);
  return heading?.[1]?.trim() || fallback;
}

export function extractExcerpt(markdown: string, maxLength = 180) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+]\([^)]+\)/g, "$1")
    .replace(/[#>*_`|~\-[\]]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
}

export function extractToc(markdown: string): TocItem[] {
  const counts = new Map<string, number>();
  const toc: TocItem[] = [];
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/#+$/, "").trim();
    toc.push({
      id: slugifyHeading(text, counts),
      text,
      level,
    });
  }

  return toc;
}
