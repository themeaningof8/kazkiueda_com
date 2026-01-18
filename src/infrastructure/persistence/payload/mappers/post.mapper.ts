/**
 * Post Mapper - Payload型とドメインエンティティ間の変換
 *
 * Payload CMSのデータ構造とドメインエンティティを分離し、
 * インフラストラクチャの変更がドメイン層に影響しないようにする
 */

import { Post, type PostContent } from "@/domain/entities/post.entity";
import { Slug } from "@/domain/value-objects/slug.vo";
import type { Post as PayloadPost } from "@/payload-types";

/**
 * PayloadのPost型をドメインのPostエンティティに変換
 */
export function toPostDomain(payloadPost: PayloadPost): Post {
  // スラグの処理
  const slug = payloadPost.slug ? Slug.create(payloadPost.slug) : Slug.fromTitle(payloadPost.title);

  if (!slug) {
    throw new Error(`Invalid slug for post: ${payloadPost.title}`);
  }

  // タグの変換
  const tags = payloadPost.tags
    ? payloadPost.tags.map((t) => ({
        tag: t.tag,
        id: t.id || undefined,
      }))
    : [];

  // featuredImageの処理（relationの場合とIDの場合を考慮）
  const featuredImageId =
    typeof payloadPost.featuredImage === "number"
      ? payloadPost.featuredImage
      : payloadPost.featuredImage?.id;

  // authorの処理（relationの場合とIDの場合を考慮）
  const authorId =
    typeof payloadPost.author === "number" ? payloadPost.author : payloadPost.author.id;

  return Post.reconstruct({
    id: payloadPost.id,
    title: payloadPost.title,
    slug: slug.toString(),
    excerpt: payloadPost.excerpt || undefined,
    content: payloadPost.content as PostContent,
    featuredImageId,
    publishedDate: payloadPost.publishedDate ? new Date(payloadPost.publishedDate) : undefined,
    tags,
    authorId,
    status: (payloadPost._status as "draft" | "published") || "draft",
    createdAt: new Date(payloadPost.createdAt),
    updatedAt: new Date(payloadPost.updatedAt),
  });
}

/**
 * ドメインのPostエンティティをPayloadのPost型に変換
 * (作成・更新時に使用)
 */
export function toPostPayload(post: Post): Partial<PayloadPost> {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || null,
    content: post.content,
    featuredImage: post.featuredImageId || null,
    publishedDate: post.publishedDate ? post.publishedDate.toISOString() : null,
    tags: post.tags.length > 0 ? post.tags : null,
    author: post.authorId,
    _status: post.status,
  };
}

/**
 * 複数のPayload Post型をドメインエンティティの配列に変換
 */
export function toPostDomainList(payloadPosts: PayloadPost[]): Post[] {
  return payloadPosts.map(toPostDomain);
}

/**
 * Slugの配列を文字列配列に変換
 */
export function slugsToStrings(posts: Post[]): string[] {
  return posts.map((p) => p.slug);
}
