import { AlertTriangle } from "lucide-react";

export function ErrorState({ title = "문제가 생겼습니다", message }: { title?: string; message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-6">{message}</p>
        </div>
      </div>
    </div>
  );
}
