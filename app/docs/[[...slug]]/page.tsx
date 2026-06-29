import { DocsClient } from "@/components/DocsClient";

export default async function DocsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  return <DocsClient initialSlug={slug.join("/")} />;
}
