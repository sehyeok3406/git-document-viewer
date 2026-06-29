import { type NextRequest, NextResponse } from "next/server";

import { jsonError, requiredParam } from "@/lib/api-response";
import { getDocsTree } from "@/lib/github-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const installationId = requiredParam(searchParams, "installationId");
    const owner = requiredParam(searchParams, "owner");
    const repo = requiredParam(searchParams, "repo");
    const branch = requiredParam(searchParams, "branch");
    const docsPath = searchParams.get("docsPath") ?? "";
    const tree = await getDocsTree(installationId, owner, repo, branch, docsPath);
    return NextResponse.json(tree);
  } catch (error) {
    return jsonError(error);
  }
}
