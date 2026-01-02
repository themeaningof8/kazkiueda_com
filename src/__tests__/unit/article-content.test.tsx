import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ArticleContent } from "@/components/article-content";
import type { Post } from "@/payload-types";

// formatDate関数のモック（厳密な型定義）
vi.mock("@/lib/format-date", () => ({
  formatDate: vi.fn<(date: string | Date) => string>((_date: string | Date) => "2024年1月15日"),
}));

// RichTextRendererコンポーネントのモック
vi.mock("@/components/rich-text", () => ({
  RichTextRenderer: ({ data }: { data: unknown }) => (
    <div data-testid="rich-text">{data ? "Rich Text Content" : null}</div>
  ),
}));

describe("ArticleContent", () => {
  const createMockPost = (overrides?: Partial<Post>): Post => {
    return {
      id: 1,
      title: "Test Article Title",
      slug: "test-article",
      excerpt: "Test excerpt",
      publishedDate: "2024-01-15",
      _status: "published",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z",
      content: {
        root: {
          children: [],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "root",
          version: 1,
        },
      },
      ...overrides,
    } as Post;
  };

  test("タイトルが表示される", () => {
    const post = createMockPost({ title: "Test Article Title" });
    render(<ArticleContent post={post} />);
    expect(screen.getByText("Test Article Title")).toBeInTheDocument();
  });

  test("抜粋が表示される", () => {
    const post = createMockPost({ excerpt: "Test excerpt text" });
    render(<ArticleContent post={post} />);
    expect(screen.getByText("Test excerpt text")).toBeInTheDocument();
  });

  test("抜粋が存在しない場合、表示されない", () => {
    const post = createMockPost({ excerpt: undefined });
    render(<ArticleContent post={post} />);
    expect(screen.queryByText(/excerpt/i)).not.toBeInTheDocument();
  });

  test("公開日が表示される", () => {
    const post = createMockPost({ publishedDate: "2024-01-15" });
    render(<ArticleContent post={post} />);
    expect(screen.getByText("2024年1月15日")).toBeInTheDocument();
  });

  test("公開日が存在しない場合、表示されない", () => {
    const post = createMockPost({ publishedDate: undefined });
    render(<ArticleContent post={post} />);
    expect(screen.queryByText(/2024年1月15日/)).not.toBeInTheDocument();
  });

  test("isPreviewがfalseの場合、ステータスが表示されない", () => {
    const post = createMockPost();
    render(<ArticleContent post={post} isPreview={false} />);
    expect(screen.queryByText(/下書き|公開/)).not.toBeInTheDocument();
  });

  test("isPreviewがtrueで_statusがdraftの場合、下書きステータスが表示される", () => {
    const post = createMockPost({ _status: "draft" });
    render(<ArticleContent post={post} isPreview={true} />);
    expect(screen.getByText("下書き")).toBeInTheDocument();
  });

  test("isPreviewがtrueで_statusがpublishedの場合、公開ステータスが表示される", () => {
    const post = createMockPost({ _status: "published" });
    render(<ArticleContent post={post} isPreview={true} />);
    expect(screen.getByText("公開")).toBeInTheDocument();
  });

  test("contentが存在する場合、RichTextRendererが表示される", () => {
    const post = createMockPost({
      content: {
        root: {
          children: [],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "root",
          version: 1,
        },
      },
    });
    render(<ArticleContent post={post} />);
    expect(screen.getByTestId("rich-text")).toBeInTheDocument();
    expect(screen.getByText("Rich Text Content")).toBeInTheDocument();
  });

  test("contentが存在しない場合、RichTextRendererが表示されない", () => {
    const post = createMockPost({ content: undefined });
    render(<ArticleContent post={post} />);
    expect(screen.queryByTestId("rich-text")).not.toBeInTheDocument();
  });

  test("contentがnullの場合、RichTextRendererが表示されない", () => {
    const post = createMockPost({ content: null as unknown as Post["content"] });
    render(<ArticleContent post={post} />);
    expect(screen.queryByTestId("rich-text")).not.toBeInTheDocument();
  });
});
