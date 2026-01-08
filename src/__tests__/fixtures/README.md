# テストフィクスチャ

テストで使用する共通のモックデータとヘルパー関数。

## 概要

テストコード内で繰り返し使用されるモックデータを一元管理することで：
- コードの重複を削減
- テストの可読性向上
- メンテナンス性の向上
- 型安全性の確保

## 使用方法

### Posts フィクスチャ

```typescript
import { createMockPost, createMockPosts, createMockPayloadResponse } from "@/__tests__/fixtures";

// 基本的な記事
const post = createMockPost();

// カスタマイズした記事
const customPost = createMockPost({
  title: "Custom Title",
  slug: "custom-slug",
});

// 複数の記事
const posts = createMockPosts(5); // 5つの記事を生成

// Payload APIレスポンス
const response = createMockPayloadResponse(posts, 1, 10);
```

### Users フィクスチャ

```typescript
import { createMockUser, createMockAdminUser } from "@/__tests__/fixtures";

// 通常ユーザー
const user = createMockUser();

// 管理者ユーザー
const admin = createMockAdminUser();

// カスタマイズしたユーザー
const customUser = createMockUser({
  email: "custom@example.com",
  name: "Custom User",
});
```

## 利用可能なフィクスチャ

### posts.ts

#### `createMockPost(overrides?)`
基本的な記事のフィクスチャを作成します。

**パラメータ:**
- `overrides`: 任意のフィールドを上書きするオブジェクト

**返り値:**
- `Partial<Post>`: 記事オブジェクト

#### `createMockDraftPost(overrides?)`
ドラフト状態の記事フィクスチャを作成します。

#### `createMockPosts(count)`
指定した数の記事フィクスチャを作成します。

**パラメータ:**
- `count`: 生成する記事の数

**返り値:**
- `Partial<Post>[]`: 記事の配列

#### `createMockPayloadResponse(docs, page?, limit?)`
Payload API レスポンスのフィクスチャを作成します。

**パラメータ:**
- `docs`: ドキュメントの配列
- `page`: ページ番号（デフォルト: 1）
- `limit`: 1ページあたりの件数（デフォルト: 10）

**返り値:**
- Payload API レスポンス形式のオブジェクト

#### `createEmptyPayloadResponse()`
空のPayload APIレスポンスを作成します。

#### `createLexicalContent(text?)`
Lexical形式のコンテンツを作成します。

**パラメータ:**
- `text`: テキストコンテンツ（オプション）

**返り値:**
- Lexical形式のコンテンツオブジェクト

#### 特殊ケース用フィクスチャ

- `mockPostWithSpecialChars`: 特殊文字を含む記事
- `mockPostWithLongContent`: 長いコンテンツの記事
- `mockPostWithEmptyContent`: 空のコンテンツの記事

### users.ts

#### `createMockUser(overrides?)`
通常ユーザーのフィクスチャを作成します。

#### `createMockAdminUser(overrides?)`
管理者ユーザーのフィクスチャを作成します。

#### `createMockUsers(count)`
指定した数のユーザーフィクスチャを作成します。

## ベストプラクティス

### 1. フィクスチャの優先使用

❌ 悪い例:
```typescript
test("記事を取得できる", async () => {
  const mockPost = {
    id: 1,
    title: "Test",
    slug: "test",
    content: { root: { ... } },
    author: 1,
    updatedAt: "2024-01-15T00:00:00.000Z",
    createdAt: "2024-01-15T00:00:00.000Z",
  };
  // ...
});
```

✅ 良い例:
```typescript
test("記事を取得できる", async () => {
  const mockPost = createMockPost({ title: "Test", slug: "test" });
  // ...
});
```

### 2. 必要な部分のみカスタマイズ

✅ 良い例:
```typescript
const post = createMockPost({
  title: "Custom Title", // テストで重要な部分のみ指定
});
```

### 3. 複数のフィクスチャが必要な場合

✅ 良い例:
```typescript
const posts = createMockPosts(10);
const response = createMockPayloadResponse(posts, 1, 10);
```

### 4. 特殊ケースの再利用

✅ 良い例:
```typescript
import { mockPostWithSpecialChars } from "@/__tests__/fixtures";

test("特殊文字を含む記事を処理できる", async () => {
  // 既存の特殊ケースフィクスチャを使用
  const result = await processPost(mockPostWithSpecialChars);
  // ...
});
```

## 新しいフィクスチャの追加

新しいコレクションやモデルのフィクスチャが必要な場合：

1. 新しいファイルを作成（例: `media.ts`）
2. `create*` 形式の関数を実装
3. `index.ts` でエクスポート

```typescript
// media.ts
import type { Media } from "@/payload-types";

export const createMockMedia = (overrides: Partial<Media> = {}): Partial<Media> => ({
  id: 1,
  filename: "test.jpg",
  mimeType: "image/jpeg",
  filesize: 1024,
  // ...
  ...overrides,
});
```

```typescript
// index.ts
export * from "./posts";
export * from "./users";
export * from "./media"; // 追加
```
