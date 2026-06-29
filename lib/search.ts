import type { MarkdownIndexItem } from "@/lib/types";

export function searchDocuments(items: MarkdownIndexItem[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  return items
    .map((item) => {
      const score =
        (item.title.toLowerCase().includes(normalizedQuery) ? 8 : 0) +
        (item.path.toLowerCase().includes(normalizedQuery) ? 4 : 0) +
        (item.content.toLowerCase().includes(normalizedQuery) ? 1 : 0);
      return { item, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "ko"))
    .map((result) => result.item);
}
