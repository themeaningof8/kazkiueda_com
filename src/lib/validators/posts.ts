import * as v from "valibot";
import { VALIDATION_LIMITS } from "@/lib/constants";

/**
 * 記事取得のスキーマ
 */
export const getPostBySlugSchema = v.object({
  slug: v.pipe(
    v.string(),
    v.minLength(1, "スラッグは必須です"),
    v.maxLength(VALIDATION_LIMITS.SLUG_MAX_LENGTH, "スラッグが長すぎます"),
  ),
  draft: v.optional(v.boolean(), false),
  overrideAccess: v.optional(v.boolean(), false),
});

/**
 * 記事一覧取得のスキーマ
 */
export const getPostsSchema = v.object({
  page: v.optional(v.pipe(v.number(), v.minValue(1, "ページは1以上である必要があります")), 1),
  limit: v.optional(
    v.pipe(v.number(), v.minValue(1), v.maxValue(100, "1回の取得は100件までです")),
    12,
  ),
  draft: v.optional(v.boolean(), false),
  overrideAccess: v.optional(v.boolean(), false),
});

/**
 * スラッグ一覧取得のスキーマ
 */
export const getPublishedPostSlugsSchema = v.object({});

export type GetPostBySlugInput = v.InferInput<typeof getPostBySlugSchema>;
export type GetPostsInput = v.InferInput<typeof getPostsSchema>;
