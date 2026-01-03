import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

/**
 * このスクリプトは、データベース内の 'payload_migrations' テーブルを確認し、
 * マイグレーションファイルが存在するが履歴が記録されていない場合に、
 * それらを「完了済み」として記録します。
 *
 * これにより、親ブランチが 'dev mode (push)' で管理されていた場合に、
 * 'payload migrate' が既存テーブルとの衝突で失敗するのを防ぎます。
 */

async function syncMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("🚀 Syncing migration state...");

    // payload_migrations テーブルがあるか確認
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payload_migrations'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log("   Creating 'payload_migrations' table...");
      await client.query(`
        CREATE TABLE IF NOT EXISTS "payload_migrations" (
          "id" serial PRIMARY KEY,
          "name" varchar(255) NOT NULL,
          "batch" integer NOT NULL,
          "updated_at" timestamp with time zone DEFAULT now(),
          "created_at" timestamp with time zone DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS "payload_migrations_name_idx" ON "payload_migrations" ("name");
      `);
    }

    // すでに記録されているマイグレーションを取得
    const existingMigrations = await client.query("SELECT name FROM payload_migrations");
    const existingNames = new Set(existingMigrations.rows.map((r) => r.name));

    // src/migrations 内のファイルを取得
    const migrationsDir = path.resolve(process.cwd(), "src/migrations");
    if (!fs.existsSync(migrationsDir)) {
      console.log("   No migrations directory found. Skipping.");
      return;
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".ts") && f !== "index.ts")
      .map((f) => f.replace(".ts", ""))
      .sort();

    let syncedCount = 0;
    for (const name of migrationFiles) {
      if (!existingNames.has(name)) {
        // テーブルが存在するか確認（存在する場合のみ同期対象）
        // 代表的なテーブル 'users' でチェック
        const usersExist = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
          );
        `);

        if (usersExist.rows[0].exists) {
          console.log(`   📝 Marking as synced: ${name}`);
          await client.query("INSERT INTO payload_migrations (name, batch) VALUES ($1, $2)", [
            name,
            1,
          ]);
          syncedCount++;
        }
      }
    }

    if (syncedCount > 0) {
      console.log(`✅ Successfully synced ${syncedCount} migration(s).`);
    } else {
      console.log("✅ All migrations are already in sync or DB is empty.");
    }
  } catch (err) {
    console.error("❌ Failed to sync migrations:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

syncMigrations();
