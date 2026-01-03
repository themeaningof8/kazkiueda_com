import { Loader2 } from "lucide-react";

/**
 * ページ全体のローディング表示
 */
export function PageLoading({ message = "ページを読み込み中..." }: { message?: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-6 text-lg text-muted-foreground">{message}</p>
    </div>
  );
}
