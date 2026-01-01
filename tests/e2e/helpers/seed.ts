import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Payload } from "payload";

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
    content: any;
    status: "published" | "draft";
    tags: Array<{ tag: string }>;
  }>;
};

const getSeedData = async (): Promise<SeedData> => {
  const seedDataPath = join(process.cwd(), "tests/e2e/fixtures/seed-data.json");
  const content = await readFile(seedDataPath, "utf-8");
  return JSON.parse(content) as SeedData;
};

export async function cleanDatabase(
  payload: Payload,
  options?: {
    keepUsers?: boolean;
  },
) {
  // 投稿を順次削除（デッドロック回避のため）
  try {
    const posts = await payload.find({ collection: "posts", limit: 100 });
    for (const post of posts.docs) {
      await payload.delete({ collection: "posts", id: post.id });
    }
  } catch (error) {
    console.warn("投稿削除でエラーが発生しましたが続行:", error);
  }

  // ユーザーは必要に応じて削除（E2Eテスト用のみ）
  if (!options?.keepUsers) {
    try {
      const users = await payload.find({
        collection: "users",
        where: { email: { contains: "e2e-" } },
        limit: 10,
      });
      for (const user of users.docs) {
        await payload.delete({ collection: "users", id: user.id });
      }
    } catch (error) {
      console.warn("ユーザー削除でエラーが発生しましたが続行:", error);
    }
  }
}

export async function seedDatabase(payload: Payload) {
  const seedDataJson = await getSeedData();

  // 既存のユーザーをチェック（認証状態を維持するため）
  const existingUser = await payload.find({
    collection: "users",
    where: { email: { equals: seedDataJson.users[0].email } },
    limit: 1,
  });

  let adminUser;
  if (existingUser.docs.length > 0) {
    adminUser = existingUser.docs[0];
  } else {
    adminUser = await payload.create({
      collection: "users",
      data: seedDataJson.users[0],
    });
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

  return {
    version: seedDataJson.version,
    adminUser: {
      id: adminUser.id,
      email: adminUser.email,
      password: seedDataJson.users[0].password, // シードデータからパスワードを取得
    },
    posts,
    // E2ETestData形式で返す
    publishedPosts: posts
      .filter((p) => p._status === "published")
      .map((p) => ({
        id: p.id,
        slug: p.slug || "",
        title: p.title,
      })),
    draftPost: {
      id: posts.find((p) => p._status === "draft")?.id || 0,
      slug: posts.find((p) => p._status === "draft")?.slug || "",
    },
  };
}
