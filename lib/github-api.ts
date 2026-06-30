import "server-only";

import { getInstallationOctokit, getInstallationToken } from "@/lib/github-app";
import { buildDocsTreeFromGitTree } from "@/lib/docs-tree";
import { displayNameFromPath, normalizeRepoPath, pathToSlug } from "@/lib/paths";
import { extractExcerpt, extractTitle } from "@/lib/markdown";
import type {
  BranchSummary,
  DocTreePayload,
  GithubContentItem,
  MarkdownIndexItem,
  RepositorySummary,
} from "@/lib/types";

export async function listInstallationRepositories(installationId: string): Promise<RepositorySummary[]> {
  const octokit = await getInstallationOctokit(installationId);
  const repositories = await octokit.paginate(octokit.apps.listReposAccessibleToInstallation, {
    per_page: 100,
  });

  return repositories.map((repo) => ({
    installationId,
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner.login,
    private: repo.private,
    defaultBranch: repo.default_branch,
    updatedAt: repo.updated_at ?? repo.pushed_at ?? "",
    description: repo.description,
  }));
}

export async function listBranches(
  installationId: string,
  owner: string,
  repo: string,
): Promise<BranchSummary[]> {
  const octokit = await getInstallationOctokit(installationId);
  const branches = await octokit.paginate(octokit.repos.listBranches, {
    owner,
    repo,
    per_page: 100,
  });

  return branches.map((branch) => ({
    name: branch.name,
    protected: branch.protected,
    commitSha: branch.commit.sha,
  }));
}

export async function listContents(
  installationId: string,
  owner: string,
  repo: string,
  branch: string,
  path = "",
): Promise<GithubContentItem[]> {
  const octokit = await getInstallationOctokit(installationId);
  const safePath = normalizeRepoPath(path);
  const response = await octokit.repos.getContent({
    owner,
    repo,
    path: safePath,
    ref: branch,
  });

  const items = Array.isArray(response.data) ? response.data : [response.data];
  return items
    .filter((item) => item.type !== "file" || item.name.toLowerCase().endsWith(".md"))
    .map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type as GithubContentItem["type"],
      size: "size" in item ? item.size : 0,
      sha: item.sha,
      downloadUrl: "download_url" in item ? item.download_url : null,
    }))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name, "ko", { numeric: true, sensitivity: "base" });
    });
}

async function getRecursiveGitTree(
  installationId: string,
  owner: string,
  repo: string,
  branch: string,
) {
  const octokit = await getInstallationOctokit(installationId);
  const branchResponse = await octokit.repos.getBranch({ owner, repo, branch });
  const treeResponse = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: branchResponse.data.commit.sha,
    recursive: "true",
  });
  return treeResponse.data.tree;
}

export async function getDocsTree(
  installationId: string,
  owner: string,
  repo: string,
  branch: string,
  docsPath: string,
): Promise<DocTreePayload> {
  const tree = await getRecursiveGitTree(installationId, owner, repo, branch);
  return buildDocsTreeFromGitTree(tree, docsPath);
}

export async function getFileBytes(
  installationId: string,
  owner: string,
  repo: string,
  branch: string,
  path: string,
) {
  const octokit = await getInstallationOctokit(installationId);
  const response = await octokit.repos.getContent({
    owner,
    repo,
    path: normalizeRepoPath(path),
    ref: branch,
  });

  if (Array.isArray(response.data) || response.data.type !== "file" || !("content" in response.data)) {
    throw new Error("Requested path is not a file");
  }

  return {
    name: response.data.name,
    bytes: Buffer.from(response.data.content, "base64"),
    downloadUrl: response.data.download_url,
  };
}

export async function getTextFile(
  installationId: string,
  owner: string,
  repo: string,
  branch: string,
  path: string,
) {
  const { bytes } = await getFileBytes(installationId, owner, repo, branch, path);
  return bytes.toString("utf8");
}

export async function getAuthenticatedRawUrl(
  installationId: string,
  owner: string,
  repo: string,
  branch: string,
  path: string,
) {
  const token = await getInstallationToken(installationId);
  const safePath = normalizeRepoPath(path)
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${safePath}?ref=${branch}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.raw",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) throw new Error(`GitHub raw file request failed: ${response.status}`);
  return response;
}

export async function getMarkdownIndex(
  installationId: string,
  owner: string,
  repo: string,
  branch: string,
  docsPath: string,
): Promise<MarkdownIndexItem[]> {
  const tree = await getDocsTree(installationId, owner, repo, branch, docsPath);
  const items: MarkdownIndexItem[] = [];

  for (const doc of tree.docs) {
    const content = await getTextFile(installationId, owner, repo, branch, doc.path);
    const title = extractTitle(content, displayNameFromPath(doc.path));
    items.push({
      title,
      path: doc.path,
      slug: doc.slug ?? pathToSlug(doc.path),
      excerpt: extractExcerpt(content),
      content,
    });
  }

  return items;
}
