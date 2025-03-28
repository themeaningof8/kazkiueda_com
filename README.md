# Astro Starter Kit: Blog

```sh
bun create astro@latest -- --template blog
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/blog)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/blog/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![blog](https://github.com/withastro/astro/assets/2244813/ff10799f-a816-4703-b967-c78997e8323d)

Features:

- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and OpenGraph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun run dev`             | Starts local dev server at `localhost:4321`      |
| `bun run build`           | Build your production site to `./dist/`          |
| `bun run preview`         | Preview your build locally, before deploying     |
| `bun run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).

## 🚀 Cloudflare Pages へのデプロイ

このプロジェクトは Cloudflare Pages へのデプロイに最適化されています。以下の手順に従ってデプロイしてください。

### 前提条件

- Cloudflare アカウント
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (オプション: CLIでのデプロイに必要)

### デプロイ方法

#### GitHubからの自動デプロイ設定

1. GitHubリポジトリにプロジェクトをプッシュします
2. [Cloudflare Pages ダッシュボード](https://dash.cloudflare.com/?to=/:account/pages)にアクセスします
3. 「Create a project」をクリックし、GitHubリポジトリと接続します
4. 以下のビルド設定を行います:
   - **Framework preset**: Astro
   - **Build command**: npm run build
   - **Build output directory**: dist
   - **環境変数**: 必要に応じて追加（.envファイルの内容）

#### Wrangler CLIを使用したデプロイ (オプション)

1. Wrangler CLIをインストールします（まだの場合）:
```bash
npm install -g wrangler
```

2. Cloudflareアカウントにログインします:
```bash
wrangler login
```

3. プロジェクトをビルドします:
```bash
npm run build
```

4. デプロイします:
```bash
wrangler pages publish dist
```

### カスタム設定

- **ヘッダー設定**: `public/_headers` ファイルでカスタムHTTPヘッダーを設定できます
- **リダイレクト設定**: `public/_redirects` ファイルでリダイレクトルールを設定できます
- **ルーティング設定**: `public/_routes.json` ファイルで静的/動的ルーティングを設定できます

詳細については [Cloudflare Pages のドキュメント](https://developers.cloudflare.com/pages/) を参照してください。
