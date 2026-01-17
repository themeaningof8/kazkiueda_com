# Application Layer (アプリケーション層)

## 概要
アプリケーション固有のビジネスロジックを実装します。

## 責務
- **ユースケース**: 具体的な操作（記事取得、一覧表示など）
- **DTO**: データ転送オブジェクト
- **ポート**: 外部システムとのインターフェース

## 依存関係ルール
✅ ドメイン層に依存可能
❌ インフラ層、プレゼンテーション層に依存不可

## 例
```typescript
// use-cases/posts/get-post-by-slug.use-case.ts
export class GetPostBySlugUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(slug: string): Promise<Result<Post>> {
    const post = await this.postRepository.findBySlug(new Slug(slug));
    if (!post) {
      return Result.fail(new PostNotFoundError(slug));
    }
    return Result.ok(post);
  }
}
```
