import { Client } from "pg";

/**
 * CI環境用のデータベース初期化スクリプト。
 * publicスキーマ内のすべてのテーブル、ビュー、型を削除します。
 * これにより、親ブランチのスキーマ状態に左右されず、
 * 'payload migrate' をクリーンな状態で実行できるようにします。
 */

async function resetDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("🧹 Resetting database schema (public)...");

    // 全テーブルを削除
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        -- テーブルとビューを削除
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS "public"."' || r.tablename || '" CASCADE';
        END LOOP;
        
        -- 型を削除（enumなど）
        FOR r IN (SELECT typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e') LOOP
          EXECUTE 'DROP TYPE IF EXISTS "public"."' || r.typname || '" CASCADE';
        END LOOP;
      END $$;
    `);

    console.log("✅ Database schema reset successfully.");
  } catch (err) {
    console.error("❌ Failed to reset database:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetDatabase();
