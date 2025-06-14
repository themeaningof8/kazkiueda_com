# Kazuki Ueda Portfolio & Blog

Astro + React + TypeScript + Tailwind CSS で構築したポートフォリオ＆ブログサイト

## 🚀 技術スタック

- **フレームワーク**: [Astro](https://astro.build/)
- **UIライブラリ**: [React](https://react.dev/)
- **言語**: [TypeScript](https://www.typescriptlang.org/)
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/)
- **UIコンポーネント**: [shadcn/ui](https://ui.shadcn.com/)
- **アニメーション**: [GSAP](https://greensock.com/gsap/)
- **デプロイ**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **計測**: Google Analytics 4 & Cloudflare Analytics

## 📁 プロジェクト構成

```
src/
├── components/          # 共通コンポーネント
│   ├── ui/             # shadcn/ui コンポーネント
│   ├── Analytics.astro # 計測タグ
│   └── Jumbotron.tsx   # ヒーローセクション
├── content/            # コンテンツ
│   ├── articles/       # ブログ記事
│   ├── portfolio/      # ポートフォリオ
│   └── config.ts       # Content Collections設定
├── layouts/            # レイアウトテンプレート
│   └── Layout.astro    # 基本レイアウト
└── pages/              # ページ
    └── index.astro     # トップページ
```

## 🛠️ セットアップ

### 前提条件

- Node.js 18.x 以上
- pnpm (推奨)

### インストール

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp env.example .env
# .env ファイルを編集してGA4_IDとCLOUDFLARE_ANALYTICS_TOKENを設定
```

### 開発

```bash
# 開発サーバーの起動
pnpm dev

# http://localhost:4321 でアクセス可能
```

## 📝 開発コマンド

| コマンド          | 説明                               |
| ----------------- | ---------------------------------- |
| `pnpm dev`        | 開発サーバーを起動                 |
| `pnpm build`      | 本番用ビルドを実行                 |
| `pnpm preview`    | ビルド後のプレビューを確認         |
| `pnpm lint`       | ESLintでコードをチェック           |
| `pnpm lint:fix`   | ESLintで自動修正可能なエラーを修正 |
| `pnpm format`     | Prettierでコードをフォーマット     |
| `pnpm type-check` | TypeScriptの型チェック             |

## 🎨 機能

### 完了済み機能

- ✅ レスポンシブデザイン
- ✅ GSAPアニメーション付きヒーローセクション
- ✅ Markdown/MDX記事サポート
- ✅ ポートフォリオ管理
- ✅ SEO最適化
- ✅ 高速な静的サイト生成
- ✅ TypeScript strictモード
- ✅ ESLint + Prettier設定
- ✅ Cloudflare Pages対応
- ✅ GA4 + Cloudflare Analytics

### 今後の拡張予定

- [ ] 記事検索機能
- [ ] タグ別フィルタリング
- [ ] コメント機能（外部サービス連携）
- [ ] RSS フィード
- [ ] サイトマップ自動生成
- [ ] 多言語対応

## 🌍 デプロイ

### Cloudflare Pages

1. GitHubリポジトリをCloudflare Pagesに接続
2. ビルド設定:
   - **Build command**: `pnpm run build`
   - **Build output directory**: `dist`
3. 環境変数を設定:
   - `PUBLIC_GA4_ID`: Google Analytics 4 ID
   - `PUBLIC_CF_ANALYTICS_TOKEN`: Cloudflare Analytics Token

## 📄 ライセンス

MIT License

## 🤝 貢献

PRやIssueはいつでも歓迎します。

---

Built with ❤️ using [Astro](https://astro.build/) and [shadcn/ui](https://ui.shadcn.com/)

```sh
pnpm create astro@latest -- --template minimal
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/minimal)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/minimal)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/minimal/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
