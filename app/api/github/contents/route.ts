import { type NextRequest, NextResponse } from "next/server";

import { jsonError, requiredParam } from "@/lib/api-response";
import { listContents } from "@/lib/github-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const installationId = requiredParam(searchParams, "installationId");
    const owner = requiredParam(searchParams, "owner");
    const repo = requiredParam(searchParams, "repo");
    const branch = requiredParam(searchParams, "branch");
    const path = searchParams.get("path") ?? "";
    const contents = await listContents(installationId, owner, repo, branch, path);
    return NextResponse.json({ contents });
  } catch (error) {
    return jsonError(error);
  }
}
