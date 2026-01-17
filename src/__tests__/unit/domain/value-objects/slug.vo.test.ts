import { describe, expect, it } from "vitest";
import { ValidationError, ValidationErrorCode } from "@/domain/errors/validation-error";
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
      expect(() => Slug.create("")).toThrow(ValidationError);
      try {
        Slug.create("");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe(ValidationErrorCode.SLUG_REQUIRED);
      }
    });

    it("URLセーフでない文字が含まれる場合はエラーをスローする", () => {
      expect(() => Slug.create("my blog post")).toThrow(ValidationError);
      try {
        Slug.create("my blog post");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe(ValidationErrorCode.SLUG_INVALID_FORMAT);
      }
    });

    it("大文字が含まれる場合はエラーをスローする", () => {
      expect(() => Slug.create("My-Blog-Post")).toThrow(ValidationError);
      try {
        Slug.create("My-Blog-Post");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe(ValidationErrorCode.SLUG_INVALID_FORMAT);
      }
    });

    it("100文字を超える場合はエラーをスローする", () => {
      const longSlug = "a".repeat(101);
      expect(() => Slug.create(longSlug)).toThrow(ValidationError);
      try {
        Slug.create(longSlug);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe(ValidationErrorCode.SLUG_TOO_LONG);
        expect((error as ValidationError).metadata?.maxLength).toBe(100);
        expect((error as ValidationError).metadata?.actualLength).toBe(101);
      }
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

    it("非常に長いタイトルの場合はundefinedを返す", () => {
      // 101文字以上の英数字のみのタイトル
      const longTitle = "a".repeat(150);
      const slug = Slug.fromTitle(longTitle);
      expect(slug).toBeUndefined();
    });
  });

  describe("toString", () => {
    it("スラッグの文字列表現を返す", () => {
      const slug = Slug.create("my-blog-post");
      expect(slug.toString()).toBe("my-blog-post");
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

    it("Slugインスタンス以外と比較するとfalseを返す", () => {
      const slug = Slug.create("my-blog-post");
      // @ts-expect-error Testing instanceof check
      expect(slug.equals("my-blog-post")).toBe(false);
      // @ts-expect-error Testing instanceof check
      expect(slug.equals(null)).toBe(false);
      // @ts-expect-error Testing instanceof check
      expect(slug.equals(undefined)).toBe(false);
      // @ts-expect-error Testing instanceof check
      expect(slug.equals({})).toBe(false);
    });
  });
});
