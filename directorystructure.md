# ディレクトリ構成

以下のディレクトリ構造に従って実装を行ってください：

```
/
├── .bolt
│   └── config.json
├── .codesandbox
│   └── Dockerfile
├── .gitignore
├── .vscode
│   ├── extensions.json
│   └── launch.json
├── README.md
├── astro.config.mjs
├── components.json
├── public
│   ├── _headers
│   ├── _redirects
│   ├── _routes.json
│   ├── blog-placeholder-1.jpg
│   ├── blog-placeholder-2.jpg
│   ├── blog-placeholder-3.jpg
│   ├── blog-placeholder-4.jpg
│   ├── blog-placeholder-5.jpg
│   ├── blog-placeholder-about.jpg
│   ├── favicon.svg
│   └── fonts
│       ├── atkinson-bold.woff
│       └── atkinson-regular.woff
├── src
│   ├── app                    # アプリケーション層
│   │   ├── layouts            # レイアウト
│   │   │   ├── BaseLayout.astro
│   │   │   └── BlogPost.astro
│   │   └── pages              # ページ
│   │       ├── about.astro
│   │       ├── blog
│   │       │   ├── [...slug].astro
│   │       │   └── index.astro
│   │       ├── index.astro
│   │       └── rss.xml.js
│   ├── assets                 # 静的アセット
│   ├── components             # 共有コンポーネント
│   │   ├── BaseHead.astro
│   │   ├── Footer.astro
│   │   ├── FormattedDate.astro
│   │   ├── Header.astro
│   │   ├── HeaderLink.astro
│   │   ├── MainNav.tsx
│   │   ├── MobileNav.tsx
│   │   ├── Search.tsx
│   │   ├── Sidebar.tsx
│   │   └── ui                 # UIコンポーネント
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       └── sheet.tsx
│   ├── config                 # グローバル設定
│   │   └── consts.ts
│   ├── content                # コンテンツ関連
│   │   ├── config.ts
│   │   └── blog
│   │       ├── first-post.md
│   │       ├── markdown-style-guide.md
│   │       ├── second-post.md
│   │       ├── third-post.md
│   │       └── using-mdx.mdx
│   ├── features               # 機能モジュール
│   │   └── blog               # ブログ機能の例
│   │       ├── api            # API関連
│   │       ├── components     # 機能固有のコンポーネント
│   │       ├── hooks          # 機能固有のフック
│   │       ├── types          # 機能固有の型定義
│   │       └── utils          # 機能固有のユーティリティ
│   ├── hooks                  # 共有フック
│   ├── lib                    # 再利用可能なライブラリ
│   │   ├── api                # API関連処理
│   │   │   ├── client.ts      # 変更禁止: AIモデル設定
│   │   │   ├── types.ts       # 変更禁止: 型定義
│   │   │   └── config.ts      # 変更禁止: 環境設定
│   │   └── utils              # 共通関数
│   │       └── utils.ts
│   ├── stores                 # 状態管理
│   ├── styles                 # スタイル定義
│   │   └── global.css
│   ├── types                  # 共有型定義
│   │   └── env.d.ts
│   └── utils                  # 共有ユーティリティ関数
├── tailwind.config.js
├── tailwind.config.mjs
├── tsconfig.json
└── wrangler.toml             # Cloudflare Wrangler設定
```

### 配置ルール

- UIコンポーネント → `src/components/ui/`
- 共通コンポーネント → `src/components/`
- 機能固有のコンポーネント → `src/features/[feature]/components/`
- APIエンドポイント → `src/app/api/[endpoint]/route.ts`
- 共通処理 → `src/lib/utils/`
- API関連処理 → `src/lib/api/`
- フック → `src/hooks/`
- 機能固有のフック → `src/features/[feature]/hooks/`
- ページコンポーネント → `src/app/pages/`
- レイアウト → `src/app/layouts/`

### 重要な注意点

- `features`ディレクトリは機能単位でコードを整理するために使用します
- 各機能は独立しており、他の機能に依存しないようにします
- 共有コードは`components`、`hooks`、`lib`、`types`、`utils`ディレクトリに配置します
- コードフローは一方向にします: 共有コード → 機能 → アプリケーション
