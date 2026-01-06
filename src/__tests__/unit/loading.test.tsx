import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { PageLoading } from "@/components/loading";

describe("PageLoading", () => {
  test("デフォルトメッセージが表示される", () => {
    render(<PageLoading />);

    expect(screen.getByText("ページを読み込み中...")).toBeInTheDocument();
  });

  test("カスタムメッセージが表示される", () => {
    render(<PageLoading message="データを取得中..." />);

    expect(screen.getByText("データを取得中...")).toBeInTheDocument();
  });

  test("Loader2アイコンが表示される", () => {
    render(<PageLoading />);

    // data-testid属性がないので、クラス名で確認
    const loader = document.querySelector(".animate-spin");
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveClass("h-12", "w-12", "text-primary");
  });

  test("適切なレイアウトクラスが適用される", () => {
    render(<PageLoading />);

    const container = screen.getByText("ページを読み込み中...").parentElement;
    expect(container).toHaveClass(
      "flex",
      "min-h-[400px]",
      "flex-col",
      "items-center",
      "justify-center",
    );
  });

  test("メッセージに適切なスタイルが適用される", () => {
    render(<PageLoading />);

    const message = screen.getByText("ページを読み込み中...");
    expect(message).toHaveClass("mt-6", "text-lg", "text-muted-foreground");
  });
});
