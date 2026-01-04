import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // slugと_statusの複合インデックスを追加
  // 公開記事のslug検索を最適化するために使用
  await db.execute(sql`
    CREATE INDEX "slug__status_idx" ON "posts" USING btree ("slug","_status");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // インデックスを削除
  await db.execute(sql`
    DROP INDEX IF EXISTS "slug__status_idx";
  `);
}
