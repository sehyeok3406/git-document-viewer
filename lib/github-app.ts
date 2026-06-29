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
