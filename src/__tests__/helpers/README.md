# テストヘルパー

統合テストで使用するヘルパー関数とユーティリティ。

## cleanup.ts

データベースのクリーンアップヘルパー関数。

### 使用例

```typescript
import { afterEach, beforeAll, describe, test } from "vitest";
import { setupTestEnvironment, teardownTestEnvironment } from "@/__tests__/helpers/cleanup";

describe("Integration Test", () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterEach(async () => {
    await teardownTestEnvironment();
  });

  test("example test", async () => {
    // テストコード
  });
});
```

### 主な関数

#### `cleanupAllData()`
全コレクションのデータをクリーンアップします（管理者ユーザー以外）。

#### `cleanupCollection(collection, where)`
特定のコレクションをクリーンアップします。

```typescript
await cleanupCollection("posts", { author: { equals: userId } });
```

#### `setupTestEnvironment()`
テスト環境のセットアップ（データクリーンアップ + 必要なデータ作成）。

#### `teardownTestEnvironment()`
テスト環境のクリーンアップ。

## 既存のヘルパー（@/test/db）

プロジェクトには既に以下のヘルパーが存在します：

### `truncateAllTables(pool)`
全テーブルのデータを削除します。統合テストで最も推奨される方法。

```typescript
import { createTestDbPool, destroyTestDbPool, truncateAllTables } from "@/test/db";

const pool = createTestDbPool();

beforeAll(async () => {
  await truncateAllTables(pool);
});

afterEach(async () => {
  await truncateAllTables(pool);
});

afterAll(async () => {
  await destroyTestDbPool(pool);
});
```

## ベストプラクティス

1. **テスト前にデータをクリーンアップ**: `beforeAll`または`beforeEach`で実行
2. **テスト後にもクリーンアップ**: `afterEach`で実行してテスト間の干渉を防ぐ
3. **独立したPayloadインスタンス**: テストごとに一意のキーを使用
4. **リソースの解放**: `afterAll`で必ずクリーンアップ

## データ分離戦略

### レベル1: テストスイート全体で共有
```typescript
beforeAll(async () => {
  await truncateAllTables(pool);
});
```

### レベル2: 各テストで独立（推奨）
```typescript
afterEach(async () => {
  await truncateAllTables(pool);
});
```

### レベル3: テストケースごとに完全分離
```typescript
test("example", async () => {
  await truncateAllTables(pool);
  // テストコード
  await truncateAllTables(pool);
});
```

## 注意事項

- **パフォーマンス**: `truncateAllTables`は高速ですが、頻繁に実行するとテストが遅くなる可能性があります
- **管理者ユーザー**: 一部のヘルパーは管理者ユーザーを自動的に保持します
- **外部キー制約**: テーブルの削除順序に注意が必要な場合は、`truncateAllTables`の実装を確認してください
