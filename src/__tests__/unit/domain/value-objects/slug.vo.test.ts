import { describe, expect, it } from "vitest";
import { Slug } from "@/domain/value-objects/slug.vo";

describe("Slug Value Object", () => {
  describe("create", () => {
    it("有効なスラッグを作成できる", () => {
      const slug = Slug.create("my-blog-post");
      expect(slug.toString()).toBe("my-blog-post");
    });

    it("英数字とハイフン、アンダースコアを含むスラッグを作成できる", () => {
      const slug = Slug.create("my_blog-post-123");
      expect(slug.toString()).toBe("my_blog-post-123");
    });

    it("空文字列の場合はエラーをスローする", () => {
      expect(() => Slug.create("")).toThrow("スラッグは必須です");
    });

    it("URLセーフでない文字が含まれる場合はエラーをスローする", () => {
      expect(() => Slug.create("my blog post")).toThrow(
        "スラッグは英数字、ハイフン、アンダースコアのみ使用できます",
      );
    });

    it("大文字が含まれる場合はエラーをスローする", () => {
      expect(() => Slug.create("My-Blog-Post")).toThrow(
        "スラッグは英数字、ハイフン、アンダースコアのみ使用できます",
      );
    });

    it("100文字を超える場合はエラーをスローする", () => {
      const longSlug = "a".repeat(101);
      expect(() => Slug.create(longSlug)).toThrow("スラッグは100文字以内で入力してください");
    });
  });

  describe("fromTitle", () => {
    it("タイトルからスラッグを生成できる", () => {
      const slug = Slug.fromTitle("My Blog Post");
      expect(slug?.toString()).toBe("my-blog-post");
    });

    it("複数のスペースをハイフンに変換する", () => {
      const slug = Slug.fromTitle("My    Blog    Post");
      expect(slug?.toString()).toBe("my-blog-post");
    });

    it("特殊文字を除去する", () => {
      const slug = Slug.fromTitle("My Blog Post! @#$");
      expect(slug?.toString()).toBe("my-blog-post");
    });

    it("日本語タイトルの場合はundefinedを返す", () => {
      const slug = Slug.fromTitle("私のブログ記事");
      expect(slug).toBeUndefined();
    });

    it("空のタイトルの場合はundefinedを返す", () => {
      const slug = Slug.fromTitle("");
      expect(slug).toBeUndefined();
    });

    it("アクセント付き文字を正規化する", () => {
      const slug = Slug.fromTitle("Café Münchën");
      expect(slug?.toString()).toBe("cafe-munchen");
    });
  });

  describe("equals", () => {
    it("同じスラッグは等価である", () => {
      const slug1 = Slug.create("my-blog-post");
      const slug2 = Slug.create("my-blog-post");
      expect(slug1.equals(slug2)).toBe(true);
    });

    it("異なるスラッグは等価でない", () => {
      const slug1 = Slug.create("my-blog-post");
      const slug2 = Slug.create("another-post");
      expect(slug1.equals(slug2)).toBe(false);
    });
  });
});
