import { type NextRequest, NextResponse } from "next/server";

import { jsonError } from "@/lib/api-response";
import { exchangeGitHubOAuthCode, githubInstallUrl, listUserInstallations } from "@/lib/github-app";

export const runtime = "nodejs";

const OAUTH_STATE_COOKIE = "git_document_viewer_oauth_state";

function redirectToSetupError(request: NextRequest, error: string) {
  const redirectUrl = new URL("/setup", request.nextUrl.origin);
  redirectUrl.searchParams.set("error", error);
  return NextResponse.redirect(redirectUrl);
}

async function handleOAuthCallback(request: NextRequest, code: string) {
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!state || !expectedState || state !== expectedState) {
    return redirectToSetupError(request, "invalid-oauth-state");
  }

  const redirectUri = new URL("/api/github/callback", request.nextUrl.origin).toString();
  const userAccessToken = await exchangeGitHubOAuthCode(code, redirectUri);
  const installations = await listUserInstallations(userAccessToken);

  if (installations.length === 0) {
    const installUrl = new URL(githubInstallUrl());
    installUrl.searchParams.set("state", "git-document-viewer");
    const response = NextResponse.redirect(installUrl);
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;
  }

  const installationIds = installations.map((installation) => String(installation.id));
  const redirectUrl = new URL("/setup/repositories", request.nextUrl.origin);
  redirectUrl.searchParams.set("installationIds", installationIds.join(","));
  if (installationIds.length === 1) redirectUrl.searchParams.set("installationId", installationIds[0]);

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.delete(OAUTH_STATE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const installationId = request.nextUrl.searchParams.get("installation_id");
    const setupAction = request.nextUrl.searchParams.get("setup_action");
    const redirectUrl = new URL("/setup/repositories", request.nextUrl.origin);

    if (code) {
      return handleOAuthCallback(request, code);
    }

    if (!installationId) {
      return redirectToSetupError(request, "missing-installation");
    }

    redirectUrl.searchParams.set("installationId", installationId);
    if (setupAction) redirectUrl.searchParams.set("setupAction", setupAction);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    return jsonError(error);
  }
}
