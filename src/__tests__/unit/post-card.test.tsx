import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostCard } from "@/components/post-card";
import type { Post } from "@/payload-types";

// formatDate関数のモック（厳密な型定義）
vi.mock("@/lib/format-date", () => ({
  formatDate: vi.fn<(date: string | Date) => string>(
    (date: string | Date) => "2024年1月15日"
  ),
}));

describe("PostCard", () => {
  const createMockPost = (overrides?: Partial<Post>): Post => {
    return {
      id: 1,
      title: "Test Post Title",
      slug: "test-post",
      excerpt: "Test excerpt",
      publishedDate: "2024-01-15",
      _status: "published",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z",
      ...overrides,
    } as Post;
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
      } as any,
    });
    render(<PostCard post={post} />);
    const image = screen.getByRole("img");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
    expect(image).toHaveAttribute("alt", "Test image");
  });

  test("featuredImage.urlがnullの場合、ImageIconが表示される", () => {
    const post = createMockPost({
      featuredImage: {
        id: 1,
        url: null,
        alt: null,
        updatedAt: "2024-01-01T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
      } as any,
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
      ],
    });
    render(<PostCard post={post} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  test("タグがstring[]形式の場合、正しく表示される", () => {
    const post = createMockPost({
      tags: ["React", "TypeScript"] as any,
    });
    render(<PostCard post={post} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
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
