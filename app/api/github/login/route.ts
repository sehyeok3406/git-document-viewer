import { randomBytes } from "crypto";
import { type NextRequest, NextResponse } from "next/server";

import { jsonError } from "@/lib/api-response";
import { githubClientId } from "@/lib/github-app";

export const runtime = "nodejs";

const OAUTH_STATE_COOKIE = "git_document_viewer_oauth_state";

export function GET(request: NextRequest) {
  try {
    const state = randomBytes(16).toString("hex");
    const redirectUri = new URL("/api/github/callback", request.nextUrl.origin);
    const authorizeUrl = new URL("https://github.com/login/oauth/authorize");

    authorizeUrl.searchParams.set("client_id", githubClientId());
    authorizeUrl.searchParams.set("redirect_uri", redirectUri.toString());
    authorizeUrl.searchParams.set("state", state);

    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      maxAge: 60 * 10,
      path: "/",
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });

    return response;
  } catch (error) {
    return jsonError(error);
  }
}
