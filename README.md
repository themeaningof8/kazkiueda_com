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

## 本番デプロイ

### A. GitHub Actions（`main` への push で自動）

[.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) が **Bun でビルド**し、`wrangler pages deploy` で Pages に載せます。

リポジトリの **Settings → Secrets and variables → Actions** に次を登録する。

| Secret | 内容 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | [API トークン](https://dash.cloudflare.com/profile/api-tokens)（**Account** → **Cloudflare Workers** など、Pages デプロイに必要な権限を含むテンプレート推奨） |
| `CLOUDFLARE_ACCOUNT_ID` | ダッシュボード右サイドバーまたは Workers 概要の **Account ID** |

**Pages のプロジェクト名**は、`wrangler pages deploy --project-name=...` と **Cloudflare ダッシュボードに表示されている名前が一字一句同じ**である必要があります。GitHub から Pages を作った場合、**リポジトリ名**（例: `kazkiueda-com`）がプロジェクト名になっていることが多いです。

GitHub Actions では、**Variable `PAGES_PROJECT_NAME` が未設定のときはリポジトリ名**（`owner/repo` の `repo` 部分）を既定のプロジェクト名に使う。ダッシュボードの名前と違うときだけ **`PAGES_PROJECT_NAME`** で上書きする。

- **API 8000007**（`Project not found`）→ その名前の **Pages プロジェクトがまだ無い**。ダッシュボードで作成するか、`bunx wrangler pages project create <名前>` で作成する。
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
2. （初回）プロジェクト作成: `bunx wrangler pages project create kazkiueda_com`
3. `bun run deploy:pages`

### C. Cloudflare ダッシュボードだけ（Git 連携ビルド）

GitHub Actions を使わず Pages がリポジトリを直接ビルドする場合の例。

1. **Workers & Pages** → **Create** → **Pages** → Git 連携。
2. **Environment variables**
   - **`SKIP_DEPENDENCY_INSTALL`**: `true`（自動の `npm install` を止める）
   - **`BUN_VERSION`**: `.bun-version` と同じ系列（例: `1.3.5`）を推奨
   - （任意）**`NODE_VERSION`**: `.nvmrc` に合わせる（`22` など）
3. **Build / Deploy（Astro + `@astrojs/cloudflare` の Workers デプロイ）**
   - **症状**: ログに `Executing user deploy command: npx wrangler deploy` だけがあり、**`astro build` の行が一度も無い** → そのままだと `The entry-point file at "@astrojs/cloudflare/entrypoints/server" was not found` になる（ビルドで `dist/` が生成されて初めてデプロイできる）。
   - **推奨（どちらか）**
     - **A**: **Build command** に `bun run build` を入れ、**Deploy command** に `npx wrangler deploy` を入れる（**先に Build が実行される**こと）。
     - **B**: UI 上「デプロイ用のコマンド」しか無い／Build が無視される場合は、**Deploy command だけ**を次の1行にする: `bun run deploy:cf-worker`（[package.json](package.json) のスクリプト。`astro build` のあと `wrangler deploy` を続けて実行する）。
   - **Build command** を別で付ける場合の例: `bun install --frozen-lockfile && bun run build`（依存はプラットフォームが既に `bun install` しているなら **`bun run build` だけ**でもよい）。
   - **Build output directory**: ダッシュボードの UI に合わせて `dist` など（プロジェクトの「Workers ビルド」向けドキュメントに従う）

4. **`.wrangler/` を Git に含めない**。ローカル用の `.wrangler/deploy/config.json` がリポジトリに入っていると、CI 上で **`dist/server/wrangler.json` が存在しないのにそのパスへリダイレクト**され、今回のようなエラーになる。本リポジトリでは [.gitignore](.gitignore) で除外済み。

5. **Custom domains**: `kazkiueda.com` を割り当て（DNS は指示に従う）。

## 補足

- **SolidJS**: `bunx astro add solid`
- **Wrangler**: `wrangler pages dev` がローカルで失敗する場合は `bun run preview` で確認し、[workers-sdk の issue](https://github.com/cloudflare/workers-sdk/issues) も参照。

## ライセンス

未定（必要に応じて追記）。
