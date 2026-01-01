import { readFile } from 'fs/promises';
import { join } from 'path';

export type E2ETestData = {
  version: string; // データ構造のバージョン
  adminUser: {
    id: number;
    email: string;
    password: string;
  };
  publishedPosts: Array<{
    id: number;
    slug: string;
    title: string;
  }>;
  draftPost: {
    id: number;
    slug: string;
  };
};

export async function requireE2ETestData(): Promise<E2ETestData> {
  const data = await getE2ETestData();
  if (!data) {
    throw new Error(
      'Test data not found. ' +
      'Ensure global-setup has completed successfully. ' +
      'Run: bun run test:e2e:setup'
    );
  }
  return data;
}

export async function getE2ETestData(): Promise<E2ETestData | null> {
  try {
    const testDataPath = join(process.cwd(), 'tests/e2e/.test-data.json');
    const content = await readFile(testDataPath, 'utf-8');
    const data = JSON.parse(content) as E2ETestData;

    // バージョンチェック（将来の互換性のため）
    if (data.version !== '1.0.0') {
      throw new Error(`テストデータのバージョンが一致しません。期待: 1.0.0, 実際: ${data.version}`);
    }

    return data;
  } catch (error) {
    // テストデータファイルが存在しない場合はnullを返す
    console.warn('テストデータファイルが見つかりません。グローバルセットアップが実行されていない可能性があります。');
    return null;
  }
}