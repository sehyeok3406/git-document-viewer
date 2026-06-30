import { type NextRequest, NextResponse } from "next/server";

import { jsonError, requiredParam } from "@/lib/api-response";
import { listInstallationRepositories } from "@/lib/github-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function installationIdsFromSearchParams(searchParams: URLSearchParams) {
  const installationIds = searchParams
    .get("installationIds")
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (installationIds?.length) return installationIds;
  return [requiredParam(searchParams, "installationId")];
}

export async function GET(request: NextRequest) {
  try {
    const installationIds = installationIdsFromSearchParams(request.nextUrl.searchParams);
    const repositoryGroups = await Promise.all(installationIds.map((id) => listInstallationRepositories(id)));
    const repositories = repositoryGroups
      .flat()
      .sort((a, b) => a.fullName.localeCompare(b.fullName, "ko", { numeric: true, sensitivity: "base" }));

    return NextResponse.json({ repositories });
  } catch (error) {
    return jsonError(error);
  }
}
