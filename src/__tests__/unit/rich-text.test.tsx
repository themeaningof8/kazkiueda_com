import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { RichTextRenderer } from "@/components/rich-text";
import { makeLexicalContent } from "@/test/helpers/lexical";

// RichTextコンポーネントのモック
const mockRichText = vi.fn();
vi.mock("@payloadcms/richtext-lexical/react", () => ({
  RichText: (props: { data: SerializedEditorState }) => {
    mockRichText(props);
    return <div data-testid="payload-rich-text">Rendered Rich Text</div>;
  },
}));

// テスト用のモックデータ生成関数
const createMockEditorState = (): SerializedEditorState => {
  return makeLexicalContent("Sample text") as SerializedEditorState;
};

describe("RichTextRenderer", () => {
  beforeEach(() => {
    mockRichText.mockClear();
  });

  describe("データの有無による表示", () => {
    test("dataがnullの場合、何も表示されない", () => {
      const { container } = render(<RichTextRenderer data={null} />);
      expect(container.firstChild).toBeNull();
      expect(mockRichText).not.toHaveBeenCalled();
    });

    test("dataがundefinedの場合、何も表示されない", () => {
      const { container } = render(<RichTextRenderer data={undefined} />);
      expect(container.firstChild).toBeNull();
      expect(mockRichText).not.toHaveBeenCalled();
    });

    test("正常なdataが渡された場合、RichTextコンポーネントがレンダリングされる", () => {
      const data = createMockEditorState();
      render(<RichTextRenderer data={data} />);

      expect(screen.getByTestId("payload-rich-text")).toBeInTheDocument();
      expect(mockRichText).toHaveBeenCalledWith({ data });
    });
  });

  describe("スタイリング", () => {
    test("proseクラスが適用される", () => {
      const data = createMockEditorState();
      const { container } = render(<RichTextRenderer data={data} />);

      const proseContainer = container.querySelector(".prose");
      expect(proseContainer).toBeInTheDocument();
      expect(proseContainer).toHaveClass("prose-lg");
      expect(proseContainer).toHaveClass("dark:prose-invert");
      expect(proseContainer).toHaveClass("max-w-none");
    });
  });
});

describe("RichTextErrorBoundary", () => {
  // エラーをスローするコンポーネント
  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error("Test error");
    }
    return <div>No error</div>;
  };

  // console.errorのモック
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    consoleErrorSpy.mockClear();
  });

  test("子コンポーネントでエラーが発生した場合、エラーメッセージが表示される", () => {
    // React はエラーバウンダリーのエラーを console.error に出力するため、
    // テスト中の不要なエラーログを抑制
    const originalError = console.error;
    console.error = vi.fn();

    // RichTextコンポーネントがエラーをスローするようにモック
    vi.resetModules();
    vi.doMock("@payloadcms/richtext-lexical/react", () => ({
      RichText: () => {
        throw new Error("RichText rendering error");
      },
    }));

    // 動的にインポートして、新しいモックを使用
    return import("@/components/rich-text").then(({ RichTextRenderer }) => {
      const data = createMockEditorState();
      render(<RichTextRenderer data={data} />);

      expect(screen.getByText("コンテンツの読み込みに失敗しました")).toBeInTheDocument();

      // console.errorを元に戻す
      console.error = originalError;
    });
  });

  test("エラーメッセージは適切なスタイルで表示される", () => {
    // React はエラーバウンダリーのエラーを console.error に出力するため、
    // テスト中の不要なエラーログを抑制
    const originalError = console.error;
    console.error = vi.fn();

    // RichTextコンポーネントがエラーをスローするようにモック
    vi.resetModules();
    vi.doMock("@payloadcms/richtext-lexical/react", () => ({
      RichText: () => {
        throw new Error("RichText rendering error");
      },
    }));

    // 動的にインポートして、新しいモックを使用
    return import("@/components/rich-text").then(({ RichTextRenderer }) => {
      const data = createMockEditorState();
      const { container } = render(<RichTextRenderer data={data} />);

      const errorElement = container.querySelector(".border-destructive\\/50");
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveClass("bg-destructive/10");
      expect(errorElement).toHaveClass("text-destructive");
      expect(errorElement).toHaveClass("rounded-lg");

      // console.errorを元に戻す
      console.error = originalError;
    });
  });
});
