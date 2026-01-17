# Domain Layer (ドメイン層)

## 概要
Clean Architectureの最内層。ビジネスルールとドメインエンティティを定義します。

## 責務
- **エンティティ**: コアビジネスオブジェクト（Post, User, Media）
- **値オブジェクト**: 不変の値を表現（Slug, Tag, PostStatus）
- **リポジトリインターフェース**: データアクセスの抽象化
- **ドメインサービス**: エンティティに属さないビジネスロジック
- **例外**: ドメイン固有のエラー

## 依存関係ルール
❌ **他の層に依存してはいけません**
✅ ドメイン層内のみ参照可能

## 例
```typescript
// entities/post.entity.ts
export class Post {
  constructor(
    public readonly id: string,
    public readonly slug: Slug,
    public readonly title: string,
    private status: PostStatus
  ) {}

  isPublished(): boolean {
    return this.status.isPublished();
  }
}
```
