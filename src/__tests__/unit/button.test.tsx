import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  test("デフォルトのボタンが正しくレンダリングされる", () => {
    render(<Button>クリック</Button>);
    const button = screen.getByRole("button", { name: /クリック/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-primary");
    expect(button).toHaveClass("text-primary-foreground");
  });

  test("バリアントが正しく適用される", () => {
    const { rerender } = render(<Button variant="destructive">削除</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-destructive");

    rerender(<Button variant="outline">アウトライン</Button>);
    expect(screen.getByRole("button")).toHaveClass("border");

    rerender(<Button variant="secondary">セカンダリ</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-secondary");

    rerender(<Button variant="ghost">ゴースト</Button>);
    expect(screen.getByRole("button")).toHaveClass("hover:bg-accent");

    rerender(<Button variant="link">リンク</Button>);
    expect(screen.getByRole("button")).toHaveClass("underline-offset-4");
  });

  test("サイズが正しく適用される", () => {
    const { rerender } = render(<Button size="sm">小</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-8");

    rerender(<Button size="lg">大</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-10");

    rerender(<Button size="icon">アイコン</Button>);
    expect(screen.getByRole("button")).toHaveClass("size-9");

    rerender(<Button size="icon-sm">小アイコン</Button>);
    expect(screen.getByRole("button")).toHaveClass("size-8");

    rerender(<Button size="icon-lg">大アイコン</Button>);
    expect(screen.getByRole("button")).toHaveClass("size-10");
  });

  test("disabled状態が正しく適用される", () => {
    render(<Button disabled>無効</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:pointer-events-none");
    expect(button).toHaveClass("disabled:opacity-50");
  });

  test("カスタムクラス名がマージされる", () => {
    render(<Button className="custom-class">カスタム</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("inline-flex"); // 元のクラスも保持
  });

  test("追加のpropsが渡される", () => {
    render(
      <Button type="submit" data-testid="submit-button">
        送信
      </Button>,
    );
    const button = screen.getByTestId("submit-button");
    expect(button).toHaveAttribute("type", "submit");
  });

  test("data属性が正しく設定される", () => {
    render(
      <Button variant="destructive" size="lg">
        テスト
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-slot", "button");
    expect(button).toHaveAttribute("data-variant", "destructive");
    expect(button).toHaveAttribute("data-size", "lg");
  });
});
