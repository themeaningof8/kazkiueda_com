import { Pool } from "pg";

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required for tests");

  // 破壊的操作（TRUNCATE）を行うため、テスト用DBっぽさを軽く検証する
  // - 例: docker-compose.test.yml は 5433 / kazkiueda_test
  // - どうしても別DBを使う場合は ALLOW_NON_TEST_DATABASE_URL=true を指定
  if (process.env.ALLOW_NON_TEST_DATABASE_URL === "true") {
    return url;
  }

  try {
    const parsed = new URL(url);
    const dbName = (parsed.pathname || "").replace(/^\//, "");
    const looksLikeTestDb =
      dbName.toLowerCase().includes("test") ||
      parsed.port === "5433" ||
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1";

    if (!looksLikeTestDb) {
      throw new Error(
        `DATABASE_URL does not look like a test database: ${parsed.hostname}:${parsed.port}/${dbName}. ` +
          `Refusing to run destructive test cleanup. ` +
          `Set ALLOW_NON_TEST_DATABASE_URL=true to override.`,
      );
    }
  } catch {
    // URLとしてパースできない場合（postgres://以外など）は、最低限 "test" を含むことだけ確認
    if (!url.toLowerCase().includes("test")) {
      throw new Error(
        `DATABASE_URL does not look like a test database. Refusing to run destructive test cleanup. ` +
          `Set ALLOW_NON_TEST_DATABASE_URL=true to override.`,
      );
    }
  }

  return url;
}

export function createTestDbPool() {
  return new Pool({
    connectionString: requireDatabaseUrl(),
    max: 1,
  });
}

export async function destroyTestDbPool(pool: Pool) {
  await pool.end();
}

/**
 * テスト用DBの全テーブルをTRUNCATEする。
 * - マイグレーション実行済み前提で、データだけをリセットする用途
 * - payload_migrations は残しておく（再マイグレーションを避ける）
 */
export async function truncateAllTables(pool: Pool) {
  // PayloadのDBアクセス（別プール）とTRUNCATEがロック競合すると deadlock が起きることがある。
  // テストの安定性のため、単一コネクション + リトライで実行する。
  const MAX_RETRIES = 5;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      // ロックが取れない場合は早めに失敗させてリトライする
      await client.query("SET LOCAL lock_timeout = '5s'");

      const { rows } = await client.query<{ tablename: string }>(
        `
          SELECT tablename
          FROM pg_tables
          WHERE schemaname = 'public'
            AND tablename <> 'payload_migrations'
        `,
      );

      const tables = rows.map((r) => r.tablename).filter(Boolean);
      if (tables.length === 0) {
        await client.query("COMMIT");
        return;
      }

      const qualified = tables.map((t) => `"public"."${t}"`).join(", ");
      await client.query(`TRUNCATE TABLE ${qualified} RESTART IDENTITY CASCADE;`);

      await client.query("COMMIT");
      return;
    } catch (err: unknown) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // ignore
      }

      const code = (err as { code?: string })?.code;
      const retryable =
        code === "40P01" || // deadlock_detected
        code === "55P03" || // lock_not_available
        code === "57014"; // query_canceled (lock_timeout など)

      if (!retryable || attempt === MAX_RETRIES) {
        throw err;
      }

      // 簡易バックオフ
      await new Promise((r) => setTimeout(r, 50 * attempt));
    } finally {
      client.release();
    }
  }
}
