import { faker } from "@faker-js/faker";
import type { Payload } from "payload";
import type { Post, User } from "@/payload-types";
import { makeLexicalContent } from "./lexical";

/**
 * テスト用ユーザーを作成
 * @param payload Payloadインスタンス
 * @param overrides カスタマイズ可能なフィールド
 * @returns 作成されたユーザー
 */
export async function createTestUser(
  payload: Payload,
  overrides?: Partial<{
    email: string;
    password: string;
    role: "admin" | "editor" | "user";
  }>,
): Promise<User> {
  const user = await payload.create({
    collection: "users",
    data: {
      email: overrides?.email ?? faker.internet.email(),
      password: overrides?.password ?? "test-password",
      role: overrides?.role ?? "user",
    },
  });

  // Payload側の型推論に任せる（createの戻りがUserとして推論される想定）
  return user;
}

/**
 * テスト用記事を作成
 * @param payload Payloadインスタンス
 * @param authorId 作成者のID
 * @param overrides カスタマイズ可能なフィールド
 * @returns 作成された記事
 */
export async function createTestPost(
  payload: Payload,
  authorId: number | User,
  overrides?: Partial<{
    title: string;
    slug: string | null;
    content?: unknown;
    status: "draft" | "published";
    publishedDate?: string;
    excerpt?: string;
    tags?: { tag: string }[];
  }>,
): Promise<Post> {
  const post = await payload.create({
    collection: "posts",
    data: {
      title: overrides?.title ?? faker.lorem.sentence(),
      slug:
        overrides?.slug === null
          ? null
          : (overrides?.slug ?? `post-${faker.string.alphanumeric(12).toLowerCase()}`),
      author: authorId,
      content: (typeof overrides?.content === "string"
        ? makeLexicalContent(overrides.content)
        : (overrides?.content ?? makeLexicalContent(faker.lorem.paragraph()))) as Post["content"],
      tags: overrides?.tags ?? [{ tag: "test" }],
      _status: overrides?.status ?? "published",
      ...(overrides?.publishedDate && { publishedDate: overrides.publishedDate }),
      ...(overrides?.excerpt && { excerpt: overrides.excerpt }),
    },
  });
  return post;
}

/**
 * テスト用記事をバルク作成
 * @param payload Payloadインスタンス
 * @param authorId 作成者のID
 * @param count 作成する記事数
 * @param overrides カスタマイズ可能なフィールド
 * @returns 作成された記事の配列
 */
export async function createBulkTestPosts(
  payload: Payload,
  authorId: number | User,
  count: number,
  overrides?: Partial<{
    title: string;
    slug: string;
    status: "draft" | "published";
    publishedDate?: string;
    excerpt?: string;
    content?: unknown;
    tags?: { tag: string }[];
  }>,
): Promise<Post[]> {
  const BATCH_SIZE = 50; // 直列実行化されたため、バッチサイズを通常の設定に戻して高速化
  const results: Post[] = [];

  const baseTimestamp = Date.now();
  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batch = Math.min(BATCH_SIZE, count - i);
    const promises = Array.from({ length: batch }, (_, j) =>
      createTestPost(payload, authorId, {
        title: `${overrides?.title ?? "Bulk Post"} ${i + j}`,
        slug: `${overrides?.slug ?? "bulk"}-${i + j}-${baseTimestamp}`,
        status: overrides?.status ?? "published",
        publishedDate: overrides?.publishedDate,
        excerpt: overrides?.excerpt,
        content: overrides?.content,
        tags: overrides?.tags,
      }),
    );

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);

    // メモリ圧を減らすため、大量データ時は少し待機
    if (count > 500 && i + BATCH_SIZE < count) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * テスト用メディアを作成（将来の拡張用）
 * @param payload Payloadインスタンス
 * @param overrides カスタマイズ可能なフィールド
 * @returns 作成されたメディア
 */
export async function createTestMedia(
  payload: Payload,
  overrides?: Partial<{
    alt: string;
    filename: string;
  }>,
): Promise<unknown> {
  // Media型が未定義のためanyを使用
  // TODO: Mediaコレクションの実装後に型を定義
  // 現在は未使用のため、基本実装のみ
  const media = await payload.create({
    collection: "media",
    data: {
      alt: overrides?.alt ?? "Test Media",
      filename: overrides?.filename ?? `test-media-${Date.now()}.jpg`,
    },
  });

  return media;
}
