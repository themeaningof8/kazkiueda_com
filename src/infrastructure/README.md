# Infrastructure Layer (インフラストラクチャ層)

## 概要
外部システムとの実際の接続を実装します。

## 責務
- **リポジトリ実装**: データベース操作の具体的な実装
- **データマッパー**: ドメインエンティティ ⟷ DB型の変換
- **外部サービス**: API、メール、ストレージなど
- **設定**: 環境変数、定数

## 依存関係ルール
✅ ドメイン層のインターフェースを実装
✅ アプリケーション層のポートを実装
❌ プレゼンテーション層に依存不可

## 例
```typescript
// persistence/payload/repositories/payload-post.repository.ts
export class PayloadPostRepository implements IPostRepository {
  async findBySlug(slug: Slug): Promise<Post | null> {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'posts',
      where: { slug: { equals: slug.value } }
    });

    if (!result.docs[0]) return null;

    return PostMapper.toDomain(result.docs[0]);
  }
}
```
