import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { PostCard } from "@/components/post-card";
import type { Post } from "@/payload-types";

// formatDate関数のモック（厳密な型定義）
vi.mock("@/lib/format-date", () => ({
  formatDate: vi.fn<(date: string | Date) => string>((_date: string | Date) => "2024年1月15日"),
}));

describe("PostCard", () => {
  // 型安全なPostオブジェクト作成ヘルパー
  const createMockPost = (overrides?: Partial<Post>): Post => {
    const basePost = {
      id: 1,
      title: "Test Post Title",
      slug: "test-post",
      excerpt: "Test excerpt",
      content: {
        root: {
          type: "root",
          format: "" as const,
          indent: 0,
          version: 1,
          children: [
            {
              type: "paragraph",
              format: "" as const,
              indent: 0,
              version: 1,
              children: [
                {
                  mode: "normal",
                  text: "Test content",
                  type: "text",
                  style: "",
                  detail: 0,
                  format: 0,
                  version: 1,
                },
              ],
            },
          ],
        },
      },
      publishedDate: "2024-01-15",
      _status: "published" as const,
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z",
      author: "test-author",
    };

    return { ...basePost, ...overrides } as Post;
  };

  test("タイトルが表示される", () => {
    const post = createMockPost();
    render(<PostCard post={post} />);
    expect(screen.getByText("Test Post Title")).toBeInTheDocument();
  });

  test("抜粋が表示される", () => {
    const post = createMockPost({ excerpt: "Test excerpt text" });
    render(<PostCard post={post} />);
    expect(screen.getByText("Test excerpt text")).toBeInTheDocument();
  });

  test("抜粋が存在しない場合、表示されない", () => {
    const post = createMockPost({ excerpt: undefined });
    render(<PostCard post={post} />);
    expect(screen.queryByText(/excerpt/i)).not.toBeInTheDocument();
  });

  test("公開日が表示される", () => {
    const post = createMockPost({ publishedDate: "2024-01-15" });
    render(<PostCard post={post} />);
    expect(screen.getByText("2024年1月15日")).toBeInTheDocument();
  });

  test("公開日が存在しない場合、表示されない", () => {
    const post = createMockPost({ publishedDate: undefined });
    render(<PostCard post={post} />);
    expect(screen.queryByText(/2024年1月15日/)).not.toBeInTheDocument();
  });

  test("featuredImageが存在しない場合、画像が表示されない", () => {
    const post = createMockPost({ featuredImage: undefined });
    render(<PostCard post={post} />);
    const images = screen.queryAllByRole("img");
    expect(images).toHaveLength(0);
  });

  test("featuredImage.urlが文字列の場合、Imageコンポーネントが表示される", () => {
    const post = createMockPost({
      featuredImage: {
        id: 1,
        url: "https://example.com/image.jpg",
        alt: "Test image",
        updatedAt: "2024-01-01T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
      } satisfies NonNullable<Post["featuredImage"]>,
    });
    render(<PostCard post={post} />);
    const image = screen.getByRole("img");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
    expect(image).toHaveAttribute("alt", "Test image");
  });

  test("featuredImage.altがundefinedの場合、post.titleがalt属性に設定される", () => {
    const post = createMockPost({
      title: "Fallback Title",
      featuredImage: {
        id: 1,
        url: "https://example.com/image.jpg",
        alt: undefined,
        updatedAt: "2024-01-01T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
      } satisfies NonNullable<Post["featuredImage"]>,
    });
    render(<PostCard post={post} />);
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("alt", "Fallback Title");
  });

  test("featuredImage.altとpost.titleが両方undefinedの場合、空文字列がalt属性に設定される", () => {
    const post = createMockPost({
      title: undefined,
      featuredImage: {
        id: 1,
        url: "https://example.com/image.jpg",
        alt: undefined,
        updatedAt: "2024-01-01T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
      } satisfies NonNullable<Post["featuredImage"]>,
    });
    render(<PostCard post={post} />);
    // alt="" の画像は getByRole で取得できないので、querySelector で取得
    const image = document.querySelector('img[alt=""]');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  test("featuredImage.urlがnullの場合、ImageIconが表示される", () => {
    const post = createMockPost({
      featuredImage: {
        id: 1,
        url: null,
        alt: null,
        updatedAt: "2024-01-01T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
      } satisfies NonNullable<Post["featuredImage"]>,
    });
    render(<PostCard post={post} />);
    // ImageIconはSVGなので、画像として検出されない
    const images = screen.queryAllByRole("img");
    expect(images).toHaveLength(0);
    // 代わりに、リンクが存在することを確認
    const link = screen.getByRole("link", { name: /Test Post Title/i });
    expect(link).toBeInTheDocument();
  });

  test("タグがTagObject[]形式の場合、正しく表示される", () => {
    const post = createMockPost({
      tags: [
        { tag: "React", id: "1" },
        { tag: "TypeScript", id: "2" },
      ] satisfies Post["tags"],
    });
    render(<PostCard post={post} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  test("タグがstring[]形式の場合、正しく表示される", () => {
    const post = createMockPost({
      tags: ["JavaScript", "CSS"] as any,
    });
    render(<PostCard post={post} />);
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("CSS")).toBeInTheDocument();
  });

  test("タグが存在しない場合、タグが表示されない", () => {
    const post = createMockPost({ tags: undefined });
    render(<PostCard post={post} />);
    expect(screen.queryByText(/React/)).not.toBeInTheDocument();
  });

  test("スラッグが正しくリンクに使用される", () => {
    const post = createMockPost({ slug: "test-post-slug" });
    render(<PostCard post={post} />);
    const links = screen.getAllByRole("link");
    // タイトルリンク、画像リンク、続きを読むリンク
    expect(links).not.toHaveLength(0);
    links.forEach((link) => {
      expect(link).toHaveAttribute("href", "/posts/test-post-slug");
    });
  });

  test("続きを読むリンクが表示される", () => {
    const post = createMockPost();
    render(<PostCard post={post} />);
    expect(screen.getByText("続きを読む →")).toBeInTheDocument();
  });
});
