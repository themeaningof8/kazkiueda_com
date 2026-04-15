# kazkiueda.com

個人サイト／ポートフォリオ（[要件](docs/requirements.md)）。スタックは **Astro 6**（**静的出力**）+ **Cloudflare Pages**（`dist` を **`wrangler pages deploy`** で公開）。

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
| `bun run deploy` / `bun run deploy:pages` | `build` のあと **`wrangler pages deploy ./dist`**（要 `wrangler login` と **Pages プロジェクト作成済み**） |
| `bun run generate-types` | `wrangler types`（任意・`wrangler.jsonc` 最小構成向け） |

ローカル用の環境変数は [`.dev.vars.example`](.dev.vars.example) を参照し、必要に応じて **`.dev.vars`** を作成する（`.dev.vars` は Git に含めない）。

`wrangler types` で生成される `worker-configuration.d.ts` は `.gitignore` 済み（リポジトリに含めない）。

## `/case-study` と検索・クローラ

採用担当には **URL のみ**共有する（Basic 認証は**廃止**）。**現職に関する情報**の外部露出を抑えるため、次を組み合わせる（詳細は [要件](docs/requirements.md) §5）。

- **`public/robots.txt`** — `/case-study` および旧互換の `/portfolio` を `Disallow`（主要ボット向けブロックあり）
- **`PortfolioLayout`** — `<meta name="robots" content="noindex, nofollow, noarchive">`
- **`public/_headers`** — `X-Robots-Tag: noindex, nofollow, noarchive`（`/case-study` および `/portfolio` 配下）

## 本番デプロイ

### GitHub Actions（`main` への push で自動）

[.github/workflows/deploy-cloudflare-pages.yml](.github/workflows/deploy-cloudflare-pages.yml) が **Bun でビルド**し、**`wrangler pages deploy ./dist --project-name=kazkiueda-com`** で **Cloudflare Pages** に載せます。ルート **`/`** は **`/case-study`** へ **302**、旧 **`/portfolio`** も **`/case-study`** へ **302**（`astro.config.mjs` の `redirects`）。

リポジトリの **Settings → Secrets and variables → Actions** に次を登録する。

| Secret | 内容 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | [API トークン](https://dash.cloudflare.com/profile/api-tokens)。**Cloudflare Pages** の編集・デプロイに必要な Account 権限を含むこと。 |
| `CLOUDFLARE_ACCOUNT_ID` | ダッシュボードの **Account ID**（**ゾーン ID と混同しない**）。 |

**プロジェクト名**は [package.json](package.json) の **`deploy:pages`** の `--project-name` と **ダッシュボードの Pages プロジェクト名が一致**していること（このリポジトリでは **`kazkiueda-com`**）。

**移行後の手動チェック（重要）**

- 同じカスタムドメインで **旧 Cloudflare Worker** がまだ有効なら、**二重公開**や意図しないルーティングになる。ダッシュボードで **Worker のルートを外す**か、Worker を削除／無効化する。
- **`PREVIEW_SECRET`** など旧 Worker 用シークレットは **不要**なら削除する。

### 手元から Wrangler

1. `bunx wrangler login`
2. （初回）`bunx wrangler pages project create kazkiueda-com` など、**`deploy:pages` と同じ名前**で Pages プロジェクトを作る。
3. `bun run deploy` または `bun run deploy:pages`

### デプロイが API 7003 / 8000007 で落ちるとき

1. **`whoami` が失敗** → `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` の誤り、または Secret に余分な改行。
2. **`Project not found`** → **`--project-name`** がダッシュボードの **Pages** プロジェクト名と一致しているか。Worker 名と混同していないか。
3. **7003** → トークンに **Pages** 向け権限がないことが多い。**Account → Cloudflare Pages → Edit** 等を付与したトークンに差し替える。

## 補足

- **SolidJS**: `bunx astro add solid`
- **Wrangler**: `wrangler pages dev` が **`dist/server/wrangler.json` が無い**等で落ちるときは、旧 Workers アダプタのキャッシュが残っていることが多い。リポジトリ直下の **`.wrangler` を削除**してから `bun run build` と `bun run pages:dev` をやり直す。それでもダメなら `bun run preview` で静的確認し、[workers-sdk の issue](https://github.com/cloudflare/workers-sdk/issues) も参照。

## ライセンス

未定（必要に応じて追記）。
