# Presentation Layer (プレゼンテーション層)

## 概要
UIコンポーネントを管理します。

## 責務
- **UIコンポーネント**: React コンポーネント
- **機能別コンポーネント**: 特定の機能に関連するUI
- **共通コンポーネント**: 再利用可能なUI要素

## 依存関係ルール
✅ ドメイン層の型を使用可能
❌ アプリケーション層、インフラ層に直接依存不可
⚠️ コントローラー経由でデータ取得

## 例
```typescript
// components/features/posts/post-card.tsx
import type { Post } from '@/domain/entities/post.entity';

export function PostCard({ post }: { post: Post }) {
  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.slug.value}</p>
    </article>
  );
}
```
