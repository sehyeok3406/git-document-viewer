import { GitBranch } from "lucide-react";

export function GithubConnectButton({ label = "GitHub 연결하기" }: { label?: string }) {
  return (
    <a
      href="/api/github/login"
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
    >
      <GitBranch className="h-4 w-4" aria-hidden />
      {label}
    </a>
  );
}
