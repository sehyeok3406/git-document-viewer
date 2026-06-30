export type SelectedDocsConfig = {
  installationId: string;
  owner: string;
  repo: string;
  branch: string;
  docsPath: string;
  selectedAt: string;
  repoFullName?: string;
  private?: boolean;
};

export type SetupDraft = {
  installationId?: string;
  installationIds?: string[];
  owner?: string;
  repo?: string;
  branch?: string;
  docsPath?: string;
  defaultBranch?: string;
  repoFullName?: string;
  private?: boolean;
};

export type RepositorySummary = {
  installationId: string;
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  defaultBranch: string;
  updatedAt: string;
  description: string | null;
};

export type BranchSummary = {
  name: string;
  protected: boolean;
  commitSha: string;
};

export type GithubContentItem = {
  name: string;
  path: string;
  type: "file" | "dir" | "symlink" | "submodule";
  size: number;
  sha: string;
  downloadUrl: string | null;
};

export type DocAsset = {
  name: string;
  path: string;
  extension: string;
};

export type DocNode = {
  type: "folder" | "file";
  name: string;
  path: string;
  displayName: string;
  slug?: string;
  children?: DocNode[];
};

export type DocTreePayload = {
  root: DocNode;
  docs: DocNode[];
  assets: DocAsset[];
};

export type MarkdownIndexItem = {
  title: string;
  path: string;
  slug: string;
  excerpt: string;
  content: string;
};

export type TocItem = {
  id: string;
  text: string;
  level: number;
};
