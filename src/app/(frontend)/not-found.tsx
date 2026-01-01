import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ページが見つかりません | 404",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="mb-4 text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
      <h2 className="mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">
        記事が見つかりません
      </h2>
      <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          ホームに戻る
        </Link>
        <Link
          href="/blog"
          className="rounded-md border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
        >
          ブログ一覧
        </Link>
      </div>
    </div>
  );
}
