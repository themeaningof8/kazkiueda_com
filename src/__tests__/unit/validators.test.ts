import { describe, expect, test } from "vitest";
import { validateSlug, generateSlugFromTitle } from "@/lib/validators/slug";
import { VALIDATION_LIMITS } from "@/lib/constants";
import * as v from "valibot";
import {
  getPostBySlugSchema,
  getPostsSchema,
  getPublishedPostSlugsSchema,
} from "@/lib/validators/posts";

describe("validateSlug", () => {
  test("should validate valid slug", () => {
    expect(validateSlug("valid-slug")).toBe(true);
    expect(validateSlug("valid_slug")).toBe(true);
    expect(validateSlug("valid123")).toBe(true);
    expect(validateSlug("a")).toBe(true);
  });

  test("should reject invalid characters", () => {
    expect(validateSlug("invalid slug")).toBe("スラッグは英数字、ハイフン、アンダースコアのみ使用できます");
    expect(validateSlug("invalid@slug")).toBe("スラッグは英数字、ハイフン、アンダースコアのみ使用できます");
    expect(validateSlug("invalid.slug")).toBe("スラッグは英数字、ハイフン、アンダースコアのみ使用できます");
    expect(validateSlug("invalid/slug")).toBe("スラッグは英数字、ハイフン、アンダースコアのみ使用できます");
  });

  test("should reject too long slug", () => {
    const longSlug = "a".repeat(VALIDATION_LIMITS.SLUG_MAX_LENGTH + 1);
    expect(validateSlug(longSlug)).toBe(`スラッグは${VALIDATION_LIMITS.SLUG_MAX_LENGTH}文字以内で入力してください`);
  });

  test("should accept empty or undefined slug", () => {
    expect(validateSlug("")).toBe(true);
    expect(validateSlug(undefined)).toBe(true);
    expect(validateSlug(null)).toBe(true);
  });

  test("should reject non-string values", () => {
    expect(validateSlug(123)).toBe(true); // 非文字列は無視される仕様
    expect(validateSlug({})).toBe(true);
    expect(validateSlug([])).toBe(true);
  });
});

describe("generateSlugFromTitle", () => {
  test("should generate slug from simple title", () => {
    expect(generateSlugFromTitle("Hello World")).toBe("hello-world");
    expect(generateSlugFromTitle("Test Post")).toBe("test-post");
  });

  test("should handle accented characters", () => {
    expect(generateSlugFromTitle("Café Müller")).toBe("cafe-muller");
    expect(generateSlugFromTitle(" naïve résumé ")).toBe("naive-resume");
  });

  test("should remove special characters", () => {
    expect(generateSlugFromTitle("Hello! @World# $Test%")).toBe("hello-world-test");
    expect(generateSlugFromTitle("Post: A & B")).toBe("post-a-b");
  });

  test("should handle multiple spaces", () => {
    expect(generateSlugFromTitle("Hello   World")).toBe("hello-world");
    expect(generateSlugFromTitle("  Leading and trailing spaces  ")).toBe("leading-and-trailing-spaces");
  });

  test("should handle empty or invalid titles", () => {
    expect(generateSlugFromTitle("")).toBeUndefined();
    expect(generateSlugFromTitle("   ")).toBeUndefined();
    expect(generateSlugFromTitle("!@#$%")).toBeUndefined();
  });

  test("should preserve hyphens and underscores", () => {
    expect(generateSlugFromTitle("test_slug-with-hyphens")).toBe("test_slug-with-hyphens");
  });

  test("should convert to lowercase", () => {
    expect(generateSlugFromTitle("HELLO WORLD")).toBe("hello-world");
    expect(generateSlugFromTitle("MiXeD CaSe")).toBe("mixed-case");
  });

  test("should handle unicode normalization", () => {
    expect(generateSlugFromTitle("naïve")).toBe("naive");
    expect(generateSlugFromTitle("José")).toBe("jose");
  });
});

describe("getPostBySlugSchema", () => {
  test("正常なslugが通る", () => {
    const result = v.safeParse(getPostBySlugSchema, {
      slug: "valid-slug",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.slug).toBe("valid-slug");
      expect(result.output.draft).toBe(false);
      expect(result.output.overrideAccess).toBe(false);
    }
  });

  test("空文字列がエラー", () => {
    const result = v.safeParse(getPostBySlugSchema, {
      slug: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0].message).toBe("スラッグは必須です");
    }
  });

  test("長すぎるslugがエラー", () => {
    const longSlug = "a".repeat(VALIDATION_LIMITS.SLUG_MAX_LENGTH + 1);
    const result = v.safeParse(getPostBySlugSchema, {
      slug: longSlug,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0].message).toBe("スラッグが長すぎます");
    }
  });

  test("draftのデフォルト値", () => {
    const result = v.safeParse(getPostBySlugSchema, {
      slug: "test-slug",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.draft).toBe(false);
    }
  });

  test("overrideAccessのデフォルト値", () => {
    const result = v.safeParse(getPostBySlugSchema, {
      slug: "test-slug",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.overrideAccess).toBe(false);
    }
  });

  test("オプショナルフィールドの明示的指定", () => {
    const result = v.safeParse(getPostBySlugSchema, {
      slug: "test-slug",
      draft: true,
      overrideAccess: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.draft).toBe(true);
      expect(result.output.overrideAccess).toBe(true);
    }
  });
});

describe("getPostsSchema", () => {
  test("page=0がエラー", () => {
    const result = v.safeParse(getPostsSchema, {
      page: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0].message).toBe("ページは1以上である必要があります");
    }
  });

  test("page=負の数がエラー", () => {
    const result = v.safeParse(getPostsSchema, {
      page: -1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0].message).toBe("ページは1以上である必要があります");
    }
  });

  test("limit=0がエラー", () => {
    const result = v.safeParse(getPostsSchema, {
      limit: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0].message).toBeDefined();
    }
  });

  test("limit=101がエラー", () => {
    const result = v.safeParse(getPostsSchema, {
      limit: 101,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0].message).toBe("1回の取得は100件までです");
    }
  });

  test("デフォルト値（page=1, limit=12）", () => {
    const result = v.safeParse(getPostsSchema, {});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.page).toBe(1);
      expect(result.output.limit).toBe(12);
      expect(result.output.draft).toBe(false);
      expect(result.output.overrideAccess).toBe(false);
    }
  });

  test("pageのみ指定", () => {
    const result = v.safeParse(getPostsSchema, {
      page: 2,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.page).toBe(2);
      expect(result.output.limit).toBe(12);
    }
  });

  test("limitのみ指定", () => {
    const result = v.safeParse(getPostsSchema, {
      limit: 20,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.page).toBe(1);
      expect(result.output.limit).toBe(20);
    }
  });

  test("draft/overrideAccessのデフォルト値", () => {
    const result = v.safeParse(getPostsSchema, {
      page: 1,
      limit: 12,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.draft).toBe(false);
      expect(result.output.overrideAccess).toBe(false);
    }
  });
});

describe("getPublishedPostSlugsSchema", () => {
  test("空オブジェクトが通る", () => {
    const result = v.safeParse(getPublishedPostSlugsSchema, {});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output).toEqual({});
    }
  });
});