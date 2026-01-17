# Interface Adapters Layer (インターフェースアダプター層)

## 概要
外部とのやり取りを制御し、データ形式を変換します。

## 責務
- **コントローラー**: 入力検証、認証、ユースケース呼び出し
- **プレゼンター**: 出力整形、機密情報フィルタリング
- **バリデーター**: リクエストデータの検証

## 依存関係ルール
✅ アプリケーション層、ドメイン層に依存可能
❌ インフラ層に依存不可

## 例
```typescript
// controllers/post.controller.ts
export class PostController {
  constructor(
    private getPostBySlugUseCase: GetPostBySlugUseCase,
    private validator: RequestValidator
  ) {}

  async getPost(slug: string): Promise<PostPresentation> {
    // 1. 入力検証
    const validatedSlug = this.validator.validateSlug(slug);

    // 2. ユースケース実行
    const result = await this.getPostBySlugUseCase.execute(validatedSlug);

    // 3. プレゼンターで変換
    return PostPresenter.toPresentation(result.data);
  }
}
```
