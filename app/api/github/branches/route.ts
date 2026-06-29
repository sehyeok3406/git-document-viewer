import { type NextRequest, NextResponse } from "next/server";

import { jsonError, requiredParam } from "@/lib/api-response";
import { listBranches } from "@/lib/github-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const installationId = requiredParam(searchParams, "installationId");
    const owner = requiredParam(searchParams, "owner");
    const repo = requiredParam(searchParams, "repo");
    const branches = await listBranches(installationId, owner, repo);
    return NextResponse.json({ branches });
  } catch (error) {
    return jsonError(error);
  }
}
