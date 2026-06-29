import { NextResponse } from "next/server";

import { githubInstallUrl } from "@/lib/github-app";
import { jsonError } from "@/lib/api-response";

export const runtime = "nodejs";

export function GET() {
  try {
    const url = new URL(githubInstallUrl());
    url.searchParams.set("state", "git-document-viewer");
    return NextResponse.redirect(url);
  } catch (error) {
    return jsonError(error);
  }
}
