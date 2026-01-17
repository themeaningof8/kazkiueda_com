# Clean Architecture 最終設計レビュー

**調査日**: 2026-01-17
**プロジェクト**: kazkiueda_com (Payload CMS + Next.js)

## 📚 調査ソース

### 実装例
- [nikolovlazar/nextjs-clean-architecture](https://github.com/nikolovlazar/nextjs-clean-architecture) - Next.js Clean Architecture標準実装
- [kuzeofficial/next-hexagonal-architecture](https://github.com/kuzeofficial/next-hexagonal-architecture) - モジュール優先のHexagonal Architecture
- [dimitridumont/clean-architecture-front-end](https://github.com/dimitridumont/clean-architecture-front-end) - フロントエンドClean Architecture

### 理論・原則
- [The Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) - Clean Architecture原典
- [Clean Architecture with Dependency Rule](https://dhruba-dahal.medium.com/clean-architecture-with-dependency-rule-by-robert-c-martin-uncle-bob-fcf227e775d9) - 依存性ルール詳解

### Next.js統合
- [Clean Architecture in Next.js 14: A Practical Guide](https://medium.com/@entekumejeffrey/clean-architecture-in-next-js-14-a-practical-guide-part-two-3e5d8dbf5a7c)
- [Production-Proven Clean Architecture in Next.js](https://dev.to/behnamrhp/stop-spaghetti-code-how-clean-architecture-saves-nextjs-projects-4l18)
- [Clean Architecture Layering in Next.js with DI](https://dev.to/behnamrhp/how-we-fixed-nextjs-at-scale-di-clean-architecture-secrets-from-production-gnj)

### Payload CMS
- [Payload 3.0: The first CMS that installs directly into any Next.js app](https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app)
- [The Ultimate Guide To Using Next.js with Payload](https://payloadcms.com/posts/blog/the-ultimate-guide-to-using-nextjs-with-payload)
- [Payload CMS Guide - WebbyCrown](https://www.webbycrown.com/payload-cms-guide/)

### アンチパターン・ベストプラクティス
- [Clean Architecture Anti-Patterns](https://github.com/k2tzumi/clean-architecture-anti-pattern)
- [5 anti-patterns developers make when implementing Clean Architecture](https://medium.com/@takendra.saraswat224/5-anti-patterns-or-mistakes-developers-make-when-implementing-clean-architecture-in-android-apps-b3e80ec744fb)
- [Clean Architecture Disadvantages](https://www.jamesmichaelhickey.com/clean-architecture/)

### DI コンテナ
- [inversify vs tsyringe vs awilix comparison](https://npm-compare.com/awilix,inversify,tsyringe)
- [Simplifying Dependency Management in Node.js](https://medium.com/@ruben.alapont/simplifying-dependency-management-in-node-js-with-container-libraries-cf5e96b7e12a)

### 代替アーキテクチャ
- [Feature-Sliced Design](https://feature-sliced.design/) - フロントエンド特化の代替アーキテクチャ

---

## 🎯 主要な発見と教訓

### 1. Clean Architectureの核心原則

#### 依存性ルール（The Dependency Rule）
> "Source code dependencies must point only inward, toward higher-level policies."
> — Robert C. Martin

**重要ポイント**:
- 外側の層は内側の層に依存できる
- 内側の層は外側の層を知らない
- ドメイン層は最も安定、インフラ層は最も変更されやすい
- この原則を守ることで、ビジネスロジックが技術詳細から独立

#### 4つの層（標準構成）

```
┌─────────────────────────────────────┐
│  Frameworks & Drivers (最外層)      │  ← Web, UI, DB, Devices
│  - app/ (Next.js)                   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Interface Adapters                 │  ← Controllers, Presenters
│  - interface-adapters/              │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Application Business Rules         │  ← Use Cases
│  - application/                     │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Enterprise Business Rules          │  ← Entities
│  - domain/                          │
└─────────────────────────────────────┘
```

### 2. Next.js特有の考慮事項

#### App Routerの配置
**結論**: `app/` ディレクトリはFrameworks & Drivers層として**独立**させる

**理由**:
- Next.jsの規約に従う（`src/app/` または `app/`）
- ビルドツールとの統合が簡単
- 他の開発者の混乱を避ける
- Server Components/Server Actionsの統合が自然

**推奨構造**:
```
src/
├── app/                 # Frameworks & Drivers層
├── interface-adapters/  # Controllers, Presenters
├── application/         # Use Cases
├── domain/             # Entities
└── infrastructure/     # Repositories実装
```

#### Server Components & Server Actions
- **Server Components**: コントローラーを通じてユースケースを呼び出す
- **Server Actions**: コントローラー層で検証・認証後、ユースケース実行
- **Route Handlers**: 同様にコントローラーパターンを使用

**重要**: ビジネスロジックをServer Componentsに直接書かない

### 3. Interface Adapters層の重要性

多くの実装で見落とされがちだが、**必須の層**:

#### Controllers（コントローラー）
```typescript
// 例: src/interface-adapters/controllers/post.controller.ts
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
    return PostPresenter.toPresentation(result);
  }
}
```

**責務**:
- 入力検証
- 認証・認可チェック
- ユースケースのオーケストレーション
- レスポンス形成（プレゼンター使用）

#### Presenters（プレゼンター）
```typescript
// 例: src/interface-adapters/presenters/post.presenter.ts
export class PostPresenter {
  static toPresentation(post: Post): PostPresentation {
    return {
      title: post.title,
      slug: post.slug.value,
      publishedAt: formatDate(post.publishedAt),
      // 機密情報を除外、表示用にフォーマット
    };
  }
}
```

**責務**:
- ドメインエンティティをDTO/表示用データに変換
- 機密情報のフィルタリング
- フォーマット調整

### 4. 依存性注入（DI）の実装

#### DIコンテナの選択

| ライブラリ | 推奨度 | 特徴 |
|-----------|-------|------|
| **Awilix** | ⭐⭐⭐⭐⭐ | デコレーター不要、軽量、スコープ対応、minify対応 |
| **TSyringe** | ⭐⭐⭐⭐ | シンプル、デコレーター使用、reflect-metadata不要 |
| **Inversify** | ⭐⭐⭐ | 高機能、複雑、reflect-metadata必要 |
| **ioctopus** | ⭐⭐⭐⭐ | サーバーレス対応、reflect-metadata不要 |

**このプロジェクトの推奨**: **Awilix** または **ioctopus**

理由:
- Bunランタイムとの互換性
- デコレーター不要（TypeScript標準に依存しない）
- サーバーレス環境（Vercel）で動作
- 軽量で高速

#### DI構造例
```typescript
// src/di/container.ts
import { createContainer, asClass, asValue } from 'awilix';

export function createDIContainer() {
  const container = createContainer();

  container.register({
    // Repositories
    postRepository: asClass(PayloadPostRepository).scoped(),

    // Use Cases
    getPostBySlugUseCase: asClass(GetPostBySlugUseCase).scoped(),

    // Controllers
    postController: asClass(PostController).scoped(),
  });

  return container;
}
```

### 5. Payload CMS 3.0特有の制約

#### payload.config.tsの配置
**結論**: **プロジェクトルートに配置必須**

Payload 3.0はNext.jsネイティブで、設定ファイルの位置が重要:
```
kazkiueda_com/
├── payload.config.ts        # ← ここに配置（必須）
├── next.config.ts
└── src/
    └── infrastructure/
        └── persistence/
            └── payload/
                ├── collections/  # 実装はここ
                ├── repositories/
                └── ...
```

#### Collections の配置
ベストプラクティス: コレクション定義は別ファイルに分離
```typescript
// payload.config.ts
import { Posts } from '@/infrastructure/persistence/payload/collections/Posts';
import { Users } from '@/infrastructure/persistence/payload/collections/Users';

export default buildConfig({
  collections: [Posts, Users, Media],
  // ...
});
```

### 6. Clean Architectureのアンチパターン

調査で明らかになった**避けるべき実装**:

#### ❌ Anti-Pattern 1: 常にすべての層を使う
```typescript
// 悪い例: シンプルな取得処理に全層を使用
Domain Entity → Value Object → Repository IF
  → Use Case → DTO → Controller → Presenter
```

**改善**: 複雑さに応じて段階的に導入
- 単純なCRUD → リポジトリパターンのみ
- ビジネスロジックあり → + ユースケース
- 複雑な処理 → 完全なClean Architecture

#### ❌ Anti-Pattern 2: フレームワーク型のドメイン層への侵入
```typescript
// 悪い例: Payload型をドメインエンティティとして使用
import { Post } from '@/payload-types';  // ❌

export class GetPostUseCase {
  execute(): Post { ... }  // ❌ インフラ層の型が漏洩
}
```

**改善**: データマッパーで変換
```typescript
// 良い例
export class PostMapper {
  static toDomain(payloadPost: PayloadPost): Post {
    return new Post({
      slug: new Slug(payloadPost.slug),
      title: payloadPost.title,
      // ...
    });
  }

  static toPayload(post: Post): PayloadPost {
    // 逆変換
  }
}
```

#### ❌ Anti-Pattern 3: ビジネスロジックのコントローラー/リポジトリへの配置
```typescript
// 悪い例
export class PostController {
  async getPost(slug: string) {
    // ❌ ビジネスロジックがコントローラーに
    if (slug.length < 3) throw new Error('Invalid');
    const post = await this.repo.findBySlug(slug);
    if (!post.isPublished) throw new Error('Not published');
    return post;
  }
}
```

**改善**: ユースケースに配置
```typescript
// 良い例
export class GetPublishedPostUseCase {
  async execute(slug: string): Promise<Result<Post>> {
    // ✅ ビジネスロジックはユースケースに
    const post = await this.repo.findBySlug(slug);
    if (!post.isPublished()) {
      return Result.fail(new PostNotPublishedError());
    }
    return Result.ok(post);
  }
}
```

#### ❌ Anti-Pattern 4: ユースケース間の依存
```typescript
// 悪い例: ユースケース同士が依存
export class CreatePostUseCase {
  constructor(
    private validateSlugUseCase: ValidateSlugUseCase  // ❌
  ) {}
}
```

**改善**: 共通ロジックはドメインサービスか値オブジェクトへ
```typescript
// 良い例
export class CreatePostUseCase {
  execute(data: CreatePostDTO) {
    const slug = new Slug(data.slug);  // ✅ 値オブジェクトで検証
    // ...
  }
}
```

### 7. 小規模プロジェクトへの適用

**重要な教訓**: Clean Architectureは銀の弾丸ではない

#### いつ使うべきか
✅ 以下の場合に推奨:
- 長期運用予定（2年以上）
- チーム開発（3人以上）
- ビジネスロジックが複雑
- 技術スタック変更の可能性
- テスタビリティが重要

❌ 以下の場合は過剰:
- プロトタイプ・MVP
- 個人プロジェクト（小規模）
- 単純なCRUDアプリ
- 短期プロジェクト

#### このプロジェクトの評価
- **コード規模**: 9,600行（中規模）
- **技術スタック**: Next.js + Payload CMS（変更の可能性低）
- **ビジネスロジック**: 中程度（記事管理、タグ、バリデーション）
- **運用期間**: 長期想定
- **テスト**: 包括的（カバレッジ80%以上）

**結論**: Clean Architectureの**段階的導入が適切**
- フル実装ではなく、必要な部分から
- 最初はリポジトリパターンとユースケース
- 複雑化に応じて層を追加

### 8. Feature-Sliced Design（代替案）

フロントエンド特化のアーキテクチャとして注目:

#### 特徴
- 7つの標準層: App, Pages, Widgets, Features, Entities, Shared, Processes
- 機能単位（スライス）で分割
- 公開API（index.ts）による厳格なカプセル化

#### Clean Architectureとの違い
| 観点 | Clean Architecture | Feature-Sliced Design |
|------|-------------------|----------------------|
| 起源 | バックエンド | フロントエンド |
| 分割軸 | 技術的関心事 | 機能/ビジネス機能 |
| 適用範囲 | 全体アーキテクチャ | UI層の構造 |
| 学習曲線 | 急 | 中程度 |

#### このプロジェクトでの評価
**推奨**: Clean Architectureを採用、FSDの概念を部分的に取り入れ

理由:
- Payload CMSバックエンドにはClean Architectureが適合
- フロントエンド（presentation層）にFSDの概念を活用
- 両者は相互補完的

---

## 🎯 最終推奨設計

### ディレクトリ構造（確定版）

```
kazkiueda_com/
├── src/
│   ├── domain/                          # 🔵 ドメイン層（Enterprise Business Rules）
│   │   ├── entities/                    # エンティティ
│   │   │   ├── post.entity.ts
│   │   │   ├── user.entity.ts
│   │   │   └── media.entity.ts
│   │   │
│   │   ├── value-objects/               # 値オブジェクト
│   │   │   ├── slug.vo.ts              # [移動] lib/validators/slug.ts
│   │   │   ├── tag.vo.ts               # [移動] lib/validators/tag.ts
│   │   │   ├── post-status.vo.ts
│   │   │   └── pagination.vo.ts
│   │   │
│   │   ├── repositories/                # リポジトリインターフェース
│   │   │   ├── post.repository.ts
│   │   │   ├── user.repository.ts
│   │   │   └── media.repository.ts
│   │   │
│   │   ├── services/                    # ドメインサービス（オプション）
│   │   │   └── post-slug-generator.service.ts
│   │   │
│   │   ├── exceptions/                  # ドメイン例外
│   │   │   ├── domain.exception.ts
│   │   │   ├── post-not-found.exception.ts
│   │   │   └── validation.exception.ts
│   │   │
│   │   └── types/                       # ドメイン型
│   │       ├── result.type.ts          # [移動] lib/types.ts
│   │       └── common.types.ts
│   │
│   ├── application/                     # 🟢 アプリケーション層（Application Business Rules）
│   │   ├── use-cases/                   # ユースケース
│   │   │   ├── posts/
│   │   │   │   ├── get-post-by-slug.use-case.ts        # [分割] lib/posts.ts
│   │   │   │   ├── get-all-posts.use-case.ts           # [分割] lib/posts.ts
│   │   │   │   ├── get-paginated-posts.use-case.ts     # [分割] lib/posts.ts
│   │   │   │   ├── get-posts-by-tag.use-case.ts        # [分割] lib/posts.ts
│   │   │   │   └── get-all-tags.use-case.ts            # [分割] lib/posts.ts
│   │   │   │
│   │   │   ├── users/
│   │   │   │   └── get-user.use-case.ts
│   │   │   │
│   │   │   └── media/
│   │   │       └── get-media.use-case.ts
│   │   │
│   │   ├── dto/                         # データ転送オブジェクト
│   │   │   ├── post.dto.ts
│   │   │   ├── pagination.dto.ts
│   │   │   └── tag.dto.ts
│   │   │
│   │   └── ports/                       # ポート（インターフェース）
│   │       ├── cache.port.ts
│   │       └── logger.port.ts
│   │
│   ├── interface-adapters/              # 🟡 インターフェースアダプター層
│   │   ├── controllers/                 # コントローラー
│   │   │   ├── post.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   └── media.controller.ts
│   │   │
│   │   ├── presenters/                  # プレゼンター
│   │   │   ├── post.presenter.ts
│   │   │   └── pagination.presenter.ts
│   │   │
│   │   └── validators/                  # 入力バリデーター
│   │       ├── post-request.validator.ts
│   │       └── common.validator.ts
│   │
│   ├── infrastructure/                  # 🟠 インフラストラクチャ層
│   │   ├── persistence/                 # データ永続化
│   │   │   └── payload/                # Payload CMS実装
│   │   │       ├── repositories/       # リポジトリ実装
│   │   │       │   ├── payload-post.repository.ts      # [改修] lib/api/payload-client.ts
│   │   │       │   ├── payload-user.repository.ts
│   │   │       │   └── payload-media.repository.ts
│   │   │       │
│   │   │       ├── mappers/            # データマッパー
│   │   │       │   ├── post.mapper.ts  # Payload型 ⟷ ドメインエンティティ
│   │   │       │   ├── user.mapper.ts
│   │   │       │   └── media.mapper.ts
│   │   │       │
│   │   │       ├── filters/            # クエリフィルター
│   │   │       │   └── payload-filters.ts              # [移動] lib/api/
│   │   │       │
│   │   │       ├── collections/        # Payloadコレクション定義
│   │   │       │   ├── Posts.ts        # [移動] collections/
│   │   │       │   ├── Users.ts        # [移動] collections/
│   │   │       │   ├── Media.ts        # [移動] collections/
│   │   │       │   └── access.ts       # [移動] collections/
│   │   │       │
│   │   │       ├── client/             # Payloadクライアント
│   │   │       │   ├── payload-client.ts               # [移動] lib/api/
│   │   │       │   └── payload-error-classifier.ts     # [移動] lib/api/
│   │   │       │
│   │   │       └── migrations/         # DBマイグレーション
│   │   │           └── ...             # [移動] migrations/
│   │   │
│   │   ├── cache/                      # キャッシュ実装
│   │   │   └── react-cache.adapter.ts
│   │   │
│   │   ├── config/                     # 設定
│   │   │   ├── env.ts                 # [移動] lib/env.ts
│   │   │   ├── constants.ts           # [移動] lib/constants.ts
│   │   │   └── performance.config.ts  # [移動] lib/performance/config.ts
│   │   │
│   │   └── utils/                      # インフラユーティリティ
│   │       ├── format-date.ts         # [移動] lib/format-date.ts
│   │       └── performance-utils.ts   # [移動] lib/performance/utils.ts
│   │
│   ├── presentation/                    # 🟣 プレゼンテーション層（UIのみ）
│   │   └── components/
│   │       ├── features/               # 機能別コンポーネント（FSD概念）
│   │       │   ├── posts/
│   │       │   │   ├── post-card.tsx          # [移動] components/
│   │       │   │   ├── article-content.tsx    # [移動] components/
│   │       │   │   └── rich-text.tsx          # [移動] components/
│   │       │   │
│   │       │   └── common/
│   │       │       ├── error-page.tsx         # [移動] components/
│   │       │       ├── loading.tsx            # [移動] components/
│   │       │       └── theme-provider.tsx     # [移動] components/
│   │       │
│   │       └── ui/                     # 基本UIコンポーネント
│   │           ├── button.tsx          # [既存]
│   │           └── pagination.tsx      # [既存]
│   │
│   ├── app/                             # 🔴 Frameworks & Drivers層
│   │   ├── (frontend)/                 # フロントエンド
│   │   │   ├── page.tsx               # [既存] トップページ
│   │   │   ├── layout.tsx             # [既存]
│   │   │   ├── not-found.tsx          # [既存]
│   │   │   ├── posts/[slug]/
│   │   │   │   └── page.tsx           # [既存]
│   │   │   ├── blog/
│   │   │   │   └── page.tsx           # [既存]
│   │   │   └── preview/
│   │   │       └── route.ts           # [既存]
│   │   │
│   │   └── (payload)/                  # Payload CMS管理画面
│   │       ├── layout.tsx              # [既存]
│   │       ├── api/[...slug]/
│   │       │   └── route.ts            # [既存]
│   │       └── admin/[[...segments]]/
│   │           ├── page.tsx            # [既存]
│   │           └── not-found.tsx       # [既存]
│   │
│   ├── di/                              # 依存性注入
│   │   ├── container.ts                # DIコンテナ設定
│   │   ├── tokens.ts                   # 注入トークン
│   │   └── scopes.ts                   # スコープ定義
│   │
│   ├── shared/                          # 共有モジュール
│   │   ├── types/
│   │   │   ├── payload-types.ts       # [移動] payload-types.ts
│   │   │   └── next.types.ts
│   │   │
│   │   └── utils/
│   │       └── common.utils.ts
│   │
│   └── __tests__/                       # テスト
│       ├── unit/
│       │   ├── domain/                 # ドメイン層テスト
│       │   │   ├── entities/
│       │   │   └── value-objects/
│       │   │
│       │   ├── application/            # アプリケーション層テスト
│       │   │   └── use-cases/
│       │   │
│       │   ├── interface-adapters/     # アダプター層テスト
│       │   │   ├── controllers/
│       │   │   └── presenters/
│       │   │
│       │   └── infrastructure/         # インフラ層テスト
│       │       └── persistence/
│       │
│       ├── integration/                # 統合テスト
│       │   ├── use-cases/
│       │   └── repositories/
│       │
│       ├── fixtures/
│       │   ├── posts.ts               # [既存]
│       │   └── users.ts               # [既存]
│       │
│       └── helpers/
│           └── cleanup.ts             # [既存]
│
├── tests/                               # E2Eテスト
│   └── e2e/                            # [既存] Playwright
│
├── public/                              # [既存] 静的ファイル
│
├── payload.config.ts                    # ⚠️ ルートに維持（Payload 3.x要件）
├── next.config.ts                       # [既存]
├── vitest.config.ts                     # [既存]
├── playwright.config.ts                 # [既存]
├── tsconfig.json                        # [更新] パスエイリアス追加
└── package.json                         # [更新] DIライブラリ追加
```

### 依存関係フロー

```
┌──────────────────────────────────────────────┐
│  app/ (Frameworks & Drivers)                 │
│  - Server Components                         │
│  - Server Actions                            │
│  - Route Handlers                            │
└────────────┬─────────────────────────────────┘
             │ 使用
             ▼
┌──────────────────────────────────────────────┐
│  interface-adapters/                         │
│  - Controllers (入力検証、認証)               │
│  - Presenters (出力整形)                      │
└────────────┬─────────────────────────────────┘
             │ 呼び出し
             ▼
┌──────────────────────────────────────────────┐
│  application/ (Use Cases)                    │
│  - ビジネスロジック                           │
│  - リポジトリIFに依存                         │
└────────────┬─────────────────────────────────┘
             │ 使用
             ▼
┌──────────────────────────────────────────────┐
│  domain/ (Entities, Value Objects)           │
│  - ビジネスルール                             │
│  - 他に依存しない                             │
└──────────────────────────────────────────────┘
             ▲
             │ 実装
┌────────────┴─────────────────────────────────┐
│  infrastructure/ (Repository実装)            │
│  - Payload CMS                               │
│  - データベース                               │
│  - 外部サービス                               │
└──────────────────────────────────────────────┘
```

### TypeScript設定（tsconfig.json更新）

```json
{
  "compilerOptions": {
    "paths": {
      "@/domain/*": ["./src/domain/*"],
      "@/application/*": ["./src/application/*"],
      "@/interface-adapters/*": ["./src/interface-adapters/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"],
      "@/presentation/*": ["./src/presentation/*"],
      "@/app/*": ["./src/app/*"],
      "@/di/*": ["./src/di/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/*": ["./src/*"]
    }
  }
}
```

### ESLint設定（層間依存チェック）

```javascript
// .eslintrc.js に追加
module.exports = {
  plugins: ['boundaries'],
  settings: {
    'boundaries/elements': [
      { type: 'domain', pattern: 'src/domain/**/*' },
      { type: 'application', pattern: 'src/application/**/*' },
      { type: 'interface-adapters', pattern: 'src/interface-adapters/**/*' },
      { type: 'infrastructure', pattern: 'src/infrastructure/**/*' },
      { type: 'presentation', pattern: 'src/presentation/**/*' },
      { type: 'app', pattern: 'src/app/**/*' },
    ],
    'boundaries/ignore': ['**/*.test.ts', '**/*.spec.ts'],
  },
  rules: {
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          // domain層は他に依存しない
          { from: 'domain', allow: ['domain'] },

          // application層はdomainにのみ依存
          { from: 'application', allow: ['domain', 'application'] },

          // interface-adapters層はapplication, domainに依存
          { from: 'interface-adapters', allow: ['domain', 'application', 'interface-adapters'] },

          // infrastructure層はdomain, applicationのインターフェースを実装
          { from: 'infrastructure', allow: ['domain', 'application', 'infrastructure'] },

          // presentation層はdomainの型のみ使用
          { from: 'presentation', allow: ['domain', 'presentation'] },

          // app層はすべてを使用可能（最外層）
          { from: 'app', allow: ['domain', 'application', 'interface-adapters', 'infrastructure', 'presentation', 'app'] },
        ],
      },
    ],
  },
};
```

---

## 🚀 段階的移行計画

### Phase 0: 準備（1週間）
- [ ] DIライブラリ選定・導入（推奨: Awilix）
- [ ] パスエイリアス設定
- [ ] ESLint boundaries プラグイン導入
- [ ] ディレクトリ構造作成（空フォルダ）

### Phase 1: ドメイン層（2週間）
- [ ] エンティティ定義（Post, User, Media）
- [ ] 値オブジェクト移行（Slug, Tag等）
- [ ] リポジトリインターフェース定義
- [ ] ドメイン例外定義
- [ ] 単体テスト作成

### Phase 2: インフラ層（2週間）
- [ ] データマッパー実装（Payload ⟷ Domain）
- [ ] リポジトリ実装（PayloadPostRepository等）
- [ ] Payload関連ファイル移動（collections, client）
- [ ] 統合テスト更新

### Phase 3: アプリケーション層（2週間）
- [ ] lib/posts.ts を個別ユースケースに分割
- [ ] DTO定義
- [ ] ユースケーステスト作成
- [ ] エラーハンドリング統一

### Phase 4: アダプター層（1週間）
- [ ] コントローラー実装
- [ ] プレゼンター実装
- [ ] 入力バリデーター移行

### Phase 5: プレゼンテーション層（1週間）
- [ ] コンポーネント整理（features/配下に移動）
- [ ] Server Componentsをコントローラー経由に変更

### Phase 6: DI統合（1週間）
- [ ] DIコンテナ設定
- [ ] 各層でDI使用
- [ ] テストでモック注入

### Phase 7: 検証・最適化（1週間）
- [ ] 全テスト実行（unit, integration, e2e）
- [ ] パフォーマンス検証
- [ ] リファクタリング
- [ ] ドキュメント更新

**合計期間**: 約10週間（2.5ヶ月）

---

## ✅ 最終チェックリスト

### アーキテクチャ原則
- [ ] 依存性ルールを厳守（内向きのみ）
- [ ] 各層の責務が明確
- [ ] フレームワーク型がドメインに侵入していない
- [ ] ビジネスロジックがユースケースに集約

### Next.js統合
- [ ] app/ がFrameworks層として独立
- [ ] Server Components/Actionsがコントローラー経由
- [ ] ISR/キャッシュ戦略が維持される

### Payload CMS統合
- [ ] payload.config.ts がルートに配置
- [ ] コレクション定義が分離
- [ ] データマッパーで型変換
- [ ] リポジトリパターンでPayload抽象化

### テスタビリティ
- [ ] DIコンテナでモック注入可能
- [ ] 各層が独立してテスト可能
- [ ] 既存テストカバレッジ維持

### 運用性
- [ ] ビルドエラーなし
- [ ] 型エラーなし
- [ ] E2Eテストパス
- [ ] パフォーマンス劣化なし

### 学習コスト
- [ ] チーム全員が理解できる
- [ ] ドキュメント整備
- [ ] 過剰エンジニアリングを避ける

---

## 📝 結論

### 最終推奨事項

1. **提案した設計を採用** - 調査結果と一致、実績あるパターン
2. **DIコンテナはAwilix** - 軽量、サーバーレス対応、デコレーター不要
3. **段階的移行を厳守** - 一度に全体を変更しない
4. **アンチパターンを意識** - 過剰エンジニアリングに注意
5. **テストカバレッジ維持** - リグレッション防止

### リスク評価

| リスク | 影響度 | 発生確率 | 対策 |
|--------|--------|---------|------|
| 過剰エンジニアリング | 高 | 中 | 段階的導入、必要な層のみ |
| 学習コスト | 中 | 高 | ドキュメント、ペアプロ |
| パフォーマンス劣化 | 中 | 低 | 継続的モニタリング |
| 既存機能の破損 | 高 | 低 | 包括的テスト |

### 成功基準

- ✅ 既存機能すべて動作
- ✅ テストカバレッジ80%以上維持
- ✅ ビルド時間20%以内の増加
- ✅ チーム全員が新構造を理解

---

**この設計で進めることを推奨します。**

段階的移行により、リスクを最小化しながら、長期的な保守性を確保できます。
