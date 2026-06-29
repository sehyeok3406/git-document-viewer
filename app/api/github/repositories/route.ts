import { type NextRequest, NextResponse } from "next/server";

import { jsonError, requiredParam } from "@/lib/api-response";
import { listInstallationRepositories } from "@/lib/github-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const installationId = requiredParam(request.nextUrl.searchParams, "installationId");
    const repositories = await listInstallationRepositories(installationId);
    return NextResponse.json({ repositories });
  } catch (error) {
    return jsonError(error);
  }
}
