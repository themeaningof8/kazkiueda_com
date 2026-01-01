import { config } from 'dotenv';
import { writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// テスト環境変数を読み込み（他のインポート前に実行）
const envTestPath = join(process.cwd(), 'projects/.env.test');

config({ path: envTestPath });

async function globalSetup() {
  console.log('🔧 E2Eグローバルセットアップ開始...');

  // 環境変数読み込み後にPayload関連をインポート
  console.log('📦 Payloadモジュール読み込み中...');
  const { getTestPayload } = await import('../../../src/test/payload');
  const { createTestUser, createBulkTestPosts, createTestPost } = await import('../../../src/test/helpers/factories');

  console.log('🗄️  Payload初期化中...');
  const payload = await getTestPayload('e2e-global-setup');
  console.log('✅ Payload初期化完了');

  try {
    const draftTitle = 'E2E Test Draft Post';
    const draftSlug = 'e2e-test-draft-post';
    const bulkTitleToken = 'Bulk Post';

    // 以前の失敗で残ったテストデータを先に掃除（ページネーションやユニーク制約の事故を防ぐ）
    console.log('🧹 既存テストデータのクリーンアップ開始...');
    try {
      const existingPosts = await payload.find({
        collection: 'posts',
        limit: 1000,
        where: {
          or: [
            { title: { contains: bulkTitleToken } },
            { title: { equals: draftTitle } },
            { slug: { equals: draftSlug } },
          ],
        },
      });

      console.log(`🗑️  ${existingPosts.docs.length}件の既存記事を削除中...`);
      for (const post of existingPosts.docs) {
        await payload.delete({
          collection: 'posts',
          id: post.id,
        });
      }
      console.log('✅ 既存記事の削除完了');
    } catch (error) {
      console.log('既存記事の削除をスキップ:', error);
    }

    // 既存のE2Eテストユーザーを削除（存在する場合）
    console.log('👤 既存テストユーザーのクリーンアップ開始...');
    try {
      const existingUsers = await payload.find({
        collection: 'users',
        where: {
          or: [
            { email: { equals: 'e2e-admin@test.com' } },
            { email: { contains: 'e2e-admin-' } },
          ],
        },
      });
      console.log(`🗑️  ${existingUsers.docs.length}件の既存ユーザーを削除中...`);
      for (const user of existingUsers.docs) {
        await payload.delete({
          collection: 'users',
          id: user.id,
        });
      }
      console.log('✅ 既存ユーザーの削除完了');
    } catch (error) {
      // 削除に失敗しても続行（ユーザーが存在しない可能性）
      console.log('既存ユーザーの削除をスキップ:', error);
    }

    // テストデータを事前作成
    console.log('👤 管理者ユーザー作成中...');
    const adminUser = await createTestUser(payload, {
      email: 'e2e-admin@test.com',
      password: 'test-password',
      role: 'admin',
    });
    console.log('✅ 管理者ユーザー作成完了');

    // ページネーション用の記事（25件 = 3ページ分）
    console.log('📝 25件のテスト記事作成中...');
    const posts = await createBulkTestPosts(payload, adminUser.id, 25, {
      status: 'published',
    });
    console.log('✅ 25件の公開記事作成完了');

    // 下書き記事
    console.log('📝 下書き記事作成中...');
    const draftPost = await createTestPost(payload, adminUser.id, {
      title: 'E2E Test Draft Post',
      slug: draftSlug,
      status: 'draft',
    });
    console.log('✅ 下書き記事作成完了');

    // テストデータIDをファイルに保存
    console.log('💾 テストデータ保存中...');
    const testData = {
      version: '1.0.0', // データ構造のバージョン
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        password: 'test-password', // 認証テストで必要
      },
      publishedPosts: posts.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title, // アサーションで使用
      })),
      draftPost: {
        id: draftPost.id,
        slug: draftPost.slug,
      },
    };

    await writeFile(
      join(process.cwd(), 'tests/e2e/.test-data.json'),
      JSON.stringify(testData, null, 2)
    );

    console.log('✅ E2Eテストデータのセットアップが完了しました');
    console.log('🎉 E2Eグローバルセットアップ完了！');
  } catch (error) {
    console.error('❌ E2Eテストデータのセットアップに失敗しました:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  } finally {
    await payload.destroy();
  }
}

export default globalSetup;