# kazkiueda.com

個人サイト／ポートフォリオ（[要件](docs/requirements.md)）。スタックは **Astro 6** + **Cloudflare Pages**（`@astrojs/cloudflare`）。

## パッケージマネージャ: Bun

**問題ありません。** Astro / Vite は Bun 上でビルド・開発できるのが一般的で、Cloudflare Pages の [v3 ビルドイメージ](https://developers.cloudflare.com/pages/configuration/build-image/)にも **Bun** がプリインストールされています（バージョンは `BUN_VERSION` で固定推奨）。

このリポジトリは **`bun.lock` のみ**（`package-lock.json` は使いません）。ローカルでも [Bun](https://bun.sh/) を入れたうえで作業してください。

- **推奨 Bun バージョン**: [.bun-version](.bun-version)（[package.json](package.json) の `packageManager` と揃えています）
- **Node との関係**: [package.json](package.json) の `engines.node` は、一部ツールや将来の CI 用の目安です。日々のコマンドは Bun で足ります。

## よく使うコマンド

| コマンド | 説明 |
|----------|------|
| `bun install` | 依存関係のインストール |
| `bun run dev` | 開発サーバー |
| `bun run build` | 本番ビルド（`dist/`） |
| `bun run preview` | ビルド結果のプレビュー |
| `bun run check` | `astro check` |
| `bun run pages:dev` | `build` のあと `wrangler pages dev ./dist` |
| `bun run deploy:pages` | `build` のあと `wrangler pages deploy`（要 `wrangler login` とプロジェクト作成済み） |
| `bun run deploy:cf-worker` | Cloudflare **ダッシュボードの Workers デプロイ**用（`build` のあと `wrangler deploy`） |
| `bun run generate-types` | `wrangler types`（任意） |

ローカル用の環境変数は [`.dev.vars.example`](.dev.vars.example) を参照し、必要に応じて **`.dev.vars`** を作成する（`.dev.vars` は Git に含めない）。

`wrangler types` で生成される `worker-configuration.d.ts` は `.gitignore` 済み（リポジトリに含めない）。

## `/portfolio` のオプション: Basic 認証（プレビュー用）

[`src/middleware.ts`](src/middleware.ts) は、環境変数 **`PREVIEW_SECRET`** が **空でないときだけ** **`/portfolio` 以下**に **HTTP Basic 認証**をかける（**パスワード**がその値。**ユーザー名は任意**）。未設定なら **ゲートなしで公開**される。

設定する場合の例:

- ローカル（Wrangler）: [`.dev.vars.example`](.dev.vars.example) をコピーして `.dev.vars` に `PREVIEW_SECRET` を書く。
- Cloudflare: ダッシュボードの **Workers & Pages** → 該当 Worker → **Settings → Variables and Secrets** に **`PREVIEW_SECRET` を Secret** で追加するか、手元で `wrangler secret put PREVIEW_SECRET` を実行する。

採用担当には **URL** と **パスワード**を別経路で渡す（Basic のダイアログにパスワードだけ入力してもよい）。

## 本番デプロイ

### A. GitHub Actions（`main` への push で自動）

[.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) が **Bun でビルド**し、`wrangler pages deploy` で Pages に載せます。

リポジトリの **Settings → Secrets and variables → Actions** に次を登録する。

| Secret | 内容 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | [API トークン](https://dash.cloudflare.com/profile/api-tokens)（**Account** → **Cloudflare Workers** など、Pages デプロイに必要な権限を含むテンプレート推奨） |
| `CLOUDFLARE_ACCOUNT_ID` | ダッシュボード右サイドバーまたは Workers 概要の **Account ID** |

**Pages のプロジェクト名**は、`wrangler pages deploy --project-name=...` と **Cloudflare ダッシュボードに表示されている名前が一字一句同じ**である必要があります。GitHub から Pages を作った場合、**リポジトリ名**（例: `kazkiueda-com`）がプロジェクト名になっていることが多いです。

GitHub Actions では、**Variable `PAGES_PROJECT_NAME` が未設定のときは [package.json](package.json) の `name`** を `pages deploy --project-name` に使う（[wrangler.jsonc](wrangler.jsonc) の Worker 名とは別）。ダッシュボードの実名と違うときだけ **`PAGES_PROJECT_NAME`** で上書きする。

- **API 8000007**（`Project not found`）→ その名前の **Pages プロジェクトがこのアカウントに無い**（**GitHub の `CLOUDFLARE_ACCOUNT_ID` が、ダッシュボードでプロジェクトを作ったアカウントと違う**ことが多い）。または **Worker 名と混同**（Pages と Worker は別）。ワークフローの Preflight で **`wrangler pages project list` に出る名前**と `PAGES_PROJECT_NAME` / `package.json` の `name` を一致させる。
- **API 7003**（`object identifier is invalid`）→ 多くの場合 **Account ID 誤り**か **トークンに Pages 権限がない**（下記「7003」節）。

**Account ID** は **ゾーン ID（ドメイン用）ではない**ことに注意する。Workers / Pages の概要画面に出る **32 桁の Account ID** を使う。

初回はダッシュボードで **Create application → Pages** からプロジェクトを作るか、`bunx wrangler pages project create <名前>` で作成する。

デプロイ時に **`pages_build_output_dir` の警告**が出ても、Astro の Cloudflare アダプタは Worker 向けの `ASSETS` バインディングを使うため、ルートの [wrangler.jsonc](wrangler.jsonc) に `pages_build_output_dir` を足すとビルドが衝突することがあります。**警告は無視してよい**（公式も「ローカル用として無視」と説明している）ケースが多いです。

### デプロイが API 7003 で落ちるとき

ワークフローに **Verify Cloudflare auth and list Pages projects** ステップがあるので、ログを順に見る。

1. **`whoami` が失敗** → `CLOUDFLARE_API_TOKEN` か `CLOUDFLARE_ACCOUNT_ID` が無効（**ゾーン ID を Account ID と間違えていないか**、Secret に**余分な改行・スペース**が入っていないか）。必要なら Secret を作り直す。
2. **`whoami` は成功だが `pages project list` が 7003** → トークンに **Pages 向け権限がない**ことが多い。ダッシュボードで **Create Token → Edit custom token** とし、**Account → Cloudflare Pages → Edit**（少なくとも Read）を付与したトークンに差し替える（「Edit Cloudflare Workers」テンプレだけでは足りないことがある）。
3. **一覧に出ている名前と `--project-name` が違う** → GitHub の **Variable `PAGES_PROJECT_NAME`** を、一覧の名前に**完全一致**で設定する。

一覧にプロジェクトが無い場合は、ダッシュボードまたは `bunx wrangler pages project create <名前>` で先に作成する。

### B. 手元から Wrangler

1. `bunx wrangler login`
2. （初回）プロジェクト作成: `bunx wrangler pages project create <名前>`（[package.json](package.json) の `deploy:pages` の `--project-name` や GitHub の **`PAGES_PROJECT_NAME`** と同じ名前にする）
3. `bun run deploy:pages`

### C. Cloudflare ダッシュボード（Workers Builds / Git 連携）

[Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) は公式どおり **「1) Build command（任意）→ 2) Deploy command」** の順で動く。**Build が空のままだと `astro build` は一切走らず**、いまのログのように **`npx wrangler deploy` だけ**になり、`@astrojs/cloudflare/entrypoints/server` が無いエラーで落ちる。

1. ダッシュボード **[Workers & Pages](https://dash.cloudflare.com/)** → **Workers** 一覧から **`kazkiueda`**（Worker 名）を開く（**Pages** のプロジェクト画面ではなく、**Worker** の画面。2欄の Build / Deploy が無ければ開く場所が違う）。
2. **Settings** → **Build**
3. 次を **保存**。

**いちばん簡単（Deploy 欄だけ直す）**

| 欄 | 入れる値 |
|----|-----------|
| **Build command (Optional)** | （空のままでよい） |
| **Deploy command** | **`bun run deploy`**（`npx wrangler deploy` のままだとビルドされない） |

[package.json](package.json) の **`deploy`** は `bun run build && wrangler deploy` なので、**Deploy だけこれに差し替えれば**公式の2段階でも1段でも、必ず `astro build` が先に走る。

**公式どおり2段に分けたい場合**

| 欄 | 入れる値 |
|----|-----------|
| **Build command** | `bun run build` |
| **Deploy command** | `npx wrangler deploy` |

4. **Environment variables**（Workers の Build 用）  
   - **`BUN_VERSION`**: `.bun-version` と同じ（例 `1.3.5`）  
   - **`NODE_VERSION`**: `.nvmrc` に合わせる（例 `22.12`）  
   - **`SKIP_DEPENDENCY_INSTALL`**: 使うなら、Build に **`bun install --frozen-lockfile && bun run build`** のように **install を自分で書く**

5. まだ古いログが出るときは **Build cache をクリア**してから再デプロイ（空の `dist` がキャッシュされていることがある）。

6. **`.wrangler/` は Git に含めない**（[.gitignore](.gitignore) 済み）。

7. **Pages** から Git 連携している場合は UI が別物のことがある。その場合は **GitHub Actions だけ**に寄せるか、上記 **Worker の Settings → Build** を探す。

### D. Cloudflare Pages（静的ホスト）としての Git 連携

Workers ではなく **Pages** だけ使う場合の話は別ドキュメントが近い。**このリポジトリは Astro SSR + Cloudflare アダプタ前提**なので、基本は **§C の Worker / Workers Builds** か **GitHub Actions** を使う想定。

## 補足

- **SolidJS**: `bunx astro add solid`
- **Wrangler**: `wrangler pages dev` がローカルで失敗する場合は `bun run preview` で確認し、[workers-sdk の issue](https://github.com/cloudflare/workers-sdk/issues) も参照。

## ライセンス

未定（必要に応じて追記）。
