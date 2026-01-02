import { Loader2 } from "lucide-react";

/**
 * 汎用ローディングコンポーネント
 */
export function LoadingSpinner({ message = "読み込み中..." }: { message?: string }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

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

/**
 * 長時間読み込み時のタイムアウト警告
 */
export function LoadingTimeout({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center text-center px-4">
      <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">読み込みに時間がかかっています</h3>
      <p className="text-sm text-muted-foreground mb-4">ネットワーク接続を確認してください</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          再試行
        </button>
      )}
    </div>
  );
}
