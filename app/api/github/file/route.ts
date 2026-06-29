import { type NextRequest, NextResponse } from "next/server";

import { jsonError, requiredParam } from "@/lib/api-response";
import { getFileBytes, getTextFile } from "@/lib/github-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function contentTypeFor(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".avif")) return "image/avif";
  if (lower.endsWith(".md")) return "text/markdown; charset=utf-8";
  return "application/octet-stream";
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const installationId = requiredParam(searchParams, "installationId");
    const owner = requiredParam(searchParams, "owner");
    const repo = requiredParam(searchParams, "repo");
    const branch = requiredParam(searchParams, "branch");
    const path = requiredParam(searchParams, "path");
    const raw = searchParams.get("raw") === "1";

    if (!raw) {
      const content = await getTextFile(installationId, owner, repo, branch, path);
      return NextResponse.json({ content });
    }

    const file = await getFileBytes(installationId, owner, repo, branch, path);
    return new Response(file.bytes, {
      headers: {
        "content-type": contentTypeFor(file.name),
        "cache-control": "private, max-age=300",
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
