"use client";

import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { dirname, joinRepoPath } from "@/lib/paths";
import { docHref, fileApiUrl } from "@/lib/routes";
import {
  resolveAsset,
  resolveRelativeMarkdownLink,
  resolveWikiDoc,
  transformObsidianSyntax,
} from "@/lib/obsidian";
import type { DocAsset, DocNode, SelectedDocsConfig } from "@/lib/types";

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function decodeProtocolValue(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function MarkdownViewer({
  content,
  currentPath,
  docs,
  assets,
  config,
}: {
  content: string;
  currentPath: string;
  docs: DocNode[];
  assets: DocAsset[];
  config: SelectedDocsConfig;
}) {
  const transformed = transformObsidianSyntax(content);

  const components: Components = {
    a({ href = "", children }) {
      if (href.startsWith("obsidian-doc:")) {
        const target = decodeProtocolValue(href.replace("obsidian-doc:", ""));
        const doc = resolveWikiDoc(target, docs);
        if (!doc?.slug) {
          return (
            <span className="rounded bg-red-100 px-1 py-0.5 text-red-800 dark:bg-red-950 dark:text-red-200">
              {children}
            </span>
          );
        }
        return (
          <Link className="font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-300" href={docHref(doc.slug)}>
            {children}
          </Link>
        );
      }

      if (href.startsWith("obsidian-tag:")) {
        return (
          <span className="inline-flex rounded-md bg-sky-100 px-1.5 py-0.5 text-xs font-semibold text-sky-800 dark:bg-sky-950 dark:text-sky-200">
            {children}
          </span>
        );
      }

      const relativeDoc = resolveRelativeMarkdownLink(href, currentPath, docs);
      if (relativeDoc?.slug) {
        return (
          <Link className="font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-300" href={docHref(relativeDoc.slug)}>
            {children}
          </Link>
        );
      }

      if (isExternalUrl(href)) {
        return (
          <a className="font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-300" href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      }

      return (
        <a className="font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-300" href={href}>
          {children}
        </a>
      );
    },
    img({ src = "", alt = "" }) {
      const source = typeof src === "string" ? src : "";
      let resolvedSrc = source;
      let missing = false;

      if (source.startsWith("obsidian-image:")) {
        const target = decodeProtocolValue(source.replace("obsidian-image:", ""));
        const asset = resolveAsset(target, currentPath, assets);
        if (asset) resolvedSrc = fileApiUrl(config, asset.path, true);
        else missing = true;
      } else if (!isExternalUrl(source) && !source.startsWith("data:")) {
        const asset = resolveAsset(source, currentPath, assets);
        const fallbackPath = source.startsWith("/") ? source.slice(1) : joinRepoPath(dirname(currentPath), source);
        resolvedSrc = fileApiUrl(config, asset?.path ?? fallbackPath, true);
      }

      if (missing) {
        return (
          <span className="my-4 block rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200">
            이미지를 찾지 못했습니다: {alt || source}
          </span>
        );
      }

      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedSrc}
          alt={alt}
          className="my-6 max-h-[720px] w-auto max-w-full rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          loading="lazy"
        />
      );
    },
    table({ children }) {
      return (
        <div className="my-6 overflow-x-auto rounded-md border border-neutral-200 dark:border-neutral-800">
          <table className="min-w-full border-collapse text-sm">{children}</table>
        </div>
      );
    },
    th({ children }) {
      return <th className="border-b border-neutral-200 bg-neutral-100 px-3 py-2 text-left font-semibold dark:border-neutral-800 dark:bg-neutral-900">{children}</th>;
    },
    td({ children }) {
      return <td className="border-b border-neutral-200 px-3 py-2 align-top dark:border-neutral-800">{children}</td>;
    },
    pre({ children }) {
      return <pre className="my-5 overflow-x-auto rounded-md border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-100">{children}</pre>;
    },
    code({ className, children }) {
      if (className) {
        return <code className={className}>{children}</code>;
      }
      return <code className="rounded bg-neutral-100 px-1 py-0.5 text-[0.92em] text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">{children}</code>;
    },
    blockquote({ children }) {
      return <blockquote className="my-5 border-l-4 border-sky-400 bg-sky-50 px-4 py-2 text-neutral-700 dark:bg-sky-950/20 dark:text-neutral-300">{children}</blockquote>;
    },
  };

  return (
    <article className="prose-shell mx-auto max-w-3xl text-[16px] leading-7 text-neutral-800 dark:text-neutral-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }], rehypeHighlight]}
        components={components}
        urlTransform={(url) => url}
      >
        {transformed}
      </ReactMarkdown>
    </article>
  );
}
