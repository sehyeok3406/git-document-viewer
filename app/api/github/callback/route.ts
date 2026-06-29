import { type NextRequest, NextResponse } from "next/server";

import { jsonError } from "@/lib/api-response";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  try {
    const installationId = request.nextUrl.searchParams.get("installation_id");
    const setupAction = request.nextUrl.searchParams.get("setup_action");
    const redirectUrl = new URL("/setup/repositories", request.nextUrl.origin);

    if (!installationId) {
      redirectUrl.pathname = "/setup";
      redirectUrl.searchParams.set("error", "missing-installation");
      return NextResponse.redirect(redirectUrl);
    }

    redirectUrl.searchParams.set("installationId", installationId);
    if (setupAction) redirectUrl.searchParams.set("setupAction", setupAction);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    return jsonError(error);
  }
}
