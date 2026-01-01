/**
 * 日付を日本語形式でフォーマットするユーティリティ関数
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
