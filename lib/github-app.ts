import "server-only";

import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function privateKey() {
  return requireEnv("GITHUB_APP_PRIVATE_KEY").replace(/\\n/g, "\n");
}

export function githubInstallUrl() {
  return requireEnv("GITHUB_APP_INSTALL_URL");
}

export function githubClientId() {
  return requireEnv("GITHUB_APP_CLIENT_ID");
}

export function githubClientSecret() {
  return requireEnv("GITHUB_APP_CLIENT_SECRET");
}

export function publicAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function getInstallationToken(installationId: string | number) {
  const auth = createAppAuth({
    appId: requireEnv("GITHUB_APP_ID"),
    privateKey: privateKey(),
    clientId: process.env.GITHUB_APP_CLIENT_ID,
    clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
  });

  const installationAuthentication = await auth({
    type: "installation",
    installationId: Number(installationId),
  });

  return installationAuthentication.token;
}

export async function getInstallationOctokit(installationId: string | number) {
  const token = await getInstallationToken(installationId);
  return new Octokit({
    auth: token,
    userAgent: "git-document-viewer",
  });
}

export async function exchangeGitHubOAuthCode(code: string, redirectUri: string) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: githubClientId(),
      client_secret: githubClientSecret(),
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error("GitHub 사용자 인증 토큰을 발급받지 못했습니다.");
  }

  const data = (await response.json()) as { access_token?: string; error_description?: string };
  if (!data.access_token) {
    throw new Error(data.error_description || "GitHub 사용자 인증 토큰이 응답에 없습니다.");
  }

  return data.access_token;
}

export async function listUserInstallations(userAccessToken: string) {
  const response = await fetch("https://api.github.com/user/installations", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${userAccessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error("설치된 GitHub App 정보를 불러오지 못했습니다.");
  }

  const data = (await response.json()) as {
    installations?: Array<{
      id: number;
      suspended_at: string | null;
    }>;
  };

  return (data.installations ?? []).filter((installation) => !installation.suspended_at);
}
