# AGENTS.md

Cursor やその他のコーディングエージェント向けのプロジェクト方針。このファイルを読んだら、下記の参照先を守ること。

## いちばん重要な参照

- **デザイン・トーン・A11y の判断**: ルートの [`CLAUDE.md`](./CLAUDE.md) の **`## Design Context`** を正とする（ユーザー・ブランド・美学・アンチパターン・Design Principles）。
- **プロダクト要件（公開範囲・認証・SEO）**: [`docs/requirements.md`](./docs/requirements.md)
- **開発・デプロイ手順**: [`README.md`](./README.md)

UI やコピーをいじるときは、先に `CLAUDE.md` の Design Context と矛盾がないか確認すること。

## スタック（要約）

- **Astro 6**（**静的ビルド**）+ **Cloudflare Pages**（`dist` を `wrangler pages deploy`）
- **Tailwind CSS v4**（エントリは `src/styles/styles.css`）
- **Starwind**（`starwind.config.json` / `src/components/starwind/`）
- パッケージマネージャは **Bun**（`package-lock.json` は使わない）

## よく使うコマンド

```bash
bun install
bun run dev
bun run build
bun run check
```

詳細は README の表を参照。

## 実装メモ

- ポートフォリオのレイアウト: `src/layouts/PortfolioLayout.astro`
- デザイントークン・グローバル CSS: `src/styles/styles.css` の `@theme` と `html.dark` ブロック
- `/portfolio` は **認証なし**（採用担当へは URL のみ共有）。検索・クローラ抑制は **`robots.txt`**、**`PortfolioLayout` の `meta robots`**、**`public/_headers` の `X-Robots-Tag`** で多層化する。
