import { config } from 'dotenv';
import { readFile, unlink, access } from 'fs/promises';
import { join } from 'path';

// テスト環境変数を読み込み（他のインポート前に実行）
config({ path: join(process.cwd(), 'projects/.env.test') });

async function globalTeardown() {
  // 環境変数読み込み後にPayload関連をインポート
  const { getTestPayload } = await import('../../../src/test/payload');
  const payload = await getTestPayload('e2e-global-teardown');
  const testDataPath = join(process.cwd(), 'tests/e2e/.test-data.json');

  // テストデータファイルが存在しない場合はスキップ
  try {
    await access(testDataPath);
  } catch {
    console.log('ℹ️ テストデータファイルが見つかりません。スキップします。');
    await payload.destroy();
    return;
  }

  try {
    const testData = JSON.parse(await readFile(testDataPath, 'utf-8')) as {
      version: string;
      publishedPosts: Array<{ id: string; slug: string; title: string }>;
      draftPost: { id: string; slug: string };
      adminUser: { id: string; email: string; password: string };
    };

    // バージョンチェック
    if (testData.version !== '1.0.0') {
      console.warn(`⚠️ テストデータのバージョンが一致しません。期待: 1.0.0, 実際: ${testData.version}`);
    }

    // 記事とユーザーを順次削除（デッドロック回避）
    try {
      // 公開記事を順次削除
      for (const post of testData.publishedPosts) {
        await payload.delete({ collection: 'posts', id: post.id })
          .catch((err: unknown) => console.warn(`記事削除失敗 (ID: ${post.id}):`, err));
      }

      // 下書き記事を削除
      await payload.delete({ collection: 'posts', id: testData.draftPost.id })
        .catch((err: unknown) => console.warn(`下書き削除失敗:`, err));

      // 管理者ユーザーを削除
      await payload.delete({ collection: 'users', id: testData.adminUser.id })
        .catch((err: unknown) => console.warn(`ユーザー削除失敗:`, err));
    } catch (error) {
      console.warn('データ削除中にエラーが発生しましたが続行:', error);
    }

    // ファイル削除は最後に実行
    await unlink(testDataPath);

    console.log('✅ E2Eテストデータのクリーンアップが完了しました');
  } catch (error) {
    console.error('❌ E2Eテストデータのクリーンアップに失敗しました:', error);
    console.warn('⚠️ 次回のテスト実行前に手動でデータをクリーンアップしてください');
  } finally {
    await payload.destroy();
  }
}

export default globalTeardown;