import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CollectionSlug, Payload, Where } from "payload";
import type { Post, User } from "../../../src/payload-types";
import type { E2ETestData } from "./test-data";

type SeedData = {
  version: string;
  users: Array<{
    email: string;
    password: string;
    role: "admin" | "editor" | "user";
  }>;
  posts: Array<{
    title: string;
    slug: string;
    content: Post["content"];
    status: "published" | "draft";
    tags: Array<{ tag: string }>;
  }>;
};

const getSeedData = async (): Promise<SeedData> => {
  const seedDataPath = join(process.cwd(), "tests/e2e/fixtures/seed-data.json");
  const content = await readFile(seedDataPath, "utf-8");
  return JSON.parse(content) as SeedData;
};

// コレクションの全レコードをページネーションしながら削除するヘルパー関数
async function deleteAllRecords(
  payload: Payload,
  collection: CollectionSlug,
  where?: Where,
  limit: number = 50,
) {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await payload.find({
      collection,
      where,
      limit,
      page,
    });

    // このページの全レコードを削除
    for (const doc of result.docs) {
      await payload.delete({ collection, id: doc.id });
    }

    // 次のページがあるかチェック
    hasMore = result.hasNextPage || false;
    page++;
  }
}

export async function cleanDatabase(
  payload: Payload,
  options?: {
    keepUsers?: boolean;
  },
) {
  // 投稿を順次削除（デッドロック回避のため）
  try {
    await deleteAllRecords(payload, "posts", undefined, 50);
  } catch (error) {
    console.warn("投稿削除でエラーが発生しましたが続行:", error);
  }

  // ユーザーは必要に応じて削除（E2Eテスト用のみ）
  if (!options?.keepUsers) {
    try {
      await deleteAllRecords(payload, "users", { email: { contains: "e2e-" } }, 50);
    } catch (error) {
      console.warn("ユーザー削除でエラーが発生しましたが続行:", error);
    }
  }
}

export async function seedDatabase(payload: Payload): Promise<E2ETestData> {
  const seedDataJson = await getSeedData();

  // 既存のユーザーをチェック（認証状態を維持するため）
  const existingUser = await payload.find({
    collection: "users",
    where: { email: { equals: seedDataJson.users[0].email } },
    limit: 1,
  });

  let adminUser: User;
  if (existingUser.docs.length > 0) {
    adminUser = existingUser.docs[0] as User;
  } else {
    adminUser = (await payload.create({
      collection: "users",
      data: seedDataJson.users[0],
    })) as User;
  }

  // 投稿を作成（statusを_statusに変換）
  const posts = await Promise.all(
    seedDataJson.posts.map((post) =>
      payload.create({
        collection: "posts",
        data: {
          ...post,
          author: adminUser.id,
          _status: post.status, // statusを_statusに変換
        },
      }),
    ),
  );

  const draftPost = posts.find((p) => p._status === "draft");
  if (!draftPost) {
    throw new Error("Draft post not found in seed data");
  }

  return {
    version: seedDataJson.version,
    adminUser: {
      id: typeof adminUser.id === "number" ? adminUser.id : Number(adminUser.id),
      email: adminUser.email,
      password: seedDataJson.users[0].password, // シードデータからパスワードを取得
    },
    // E2ETestData形式で返す
    publishedPosts: posts
      .filter((p) => p._status === "published")
      .map((p) => ({
        id: typeof p.id === "number" ? p.id : Number(p.id),
        slug: p.slug || "",
        title: p.title,
      })),
    draftPost: {
      id: typeof draftPost.id === "number" ? draftPost.id : Number(draftPost.id),
      slug: draftPost.slug || "",
    },
  };
}
