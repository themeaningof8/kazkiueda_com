# Portfolio — Pages static deploy, no Basic auth, crawl headers — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved design: static Astro build, deploy **`dist`** to **Cloudflare Pages** from **GitHub Actions**, remove **`/portfolio` Basic auth**, add **`X-Robots-Tag`** and expanded **`robots.txt`**, and align docs plus **`wrangler.jsonc`** so production is unambiguously **Pages**, not Workers.

**Architecture:** Remove **`@astrojs/cloudflare`** and all **`cloudflare:workers`** usage so the site is **fully static** (`output: 'static'`). Root **`/`** becomes a **build-time redirect** to **`/portfolio`** via **`astro.config` `redirects`** (delete **`src/pages/index.astro`**). **`/portfolio`** listing uses **`prerender = true`**. Delete **`src/middleware.ts`**. Crawl signals: existing **`PortfolioLayout`** meta, **`public/robots.txt`** (plus bot-specific blocks), **`public/_headers`** for **`/portfolio`** paths. CI runs **`wrangler pages deploy ./dist --project-name=kazkiueda-com`** (same name as **`package.json`** `deploy:pages`).

**Tech Stack:** Astro 6, Tailwind v4 (`@tailwindcss/vite`), `astro:content` / `astro:assets`, Wrangler 4.81.x, Bun, GitHub Actions.

**Verification note:** No Vitest/Playwright in repo. Every task that changes code ends with **`bun run check`** and **`bun run build`** unless noted. Manual: **`bun run pages:dev`** then curl **`/portfolio`** headers.

**Spec reference:** `docs/superpowers/specs/2026-04-13-portfolio-pages-static-no-auth-design.md`（著者承認済み）

---

## File map

| Path | 役割 |
|------|------|
| `astro.config.mjs` | `output: 'static'`、`redirects`（`/`→`/portfolio` 302）、adapter/session 削除 |
| `src/pages/index.astro` | **削除**（redirect は設定に移す） |
| `src/pages/portfolio/index.astro` | `prerender = true` に変更 |
| `src/middleware.ts` | **削除** |
| `env.d.ts` | `PREVIEW_SECRET` / `cloudflare:workers` 宣言を削除 |
| `package.json` | `@astrojs/cloudflare` 削除、`deploy` を Pages 向けに、`pages:dev` のコメント整合 |
| `wrangler.jsonc` | Workers `main` / `assets` をやめ、CLI 用の最小設定（名前・`compatibility_date` のみ）に簡素化 |
| `public/_headers` | **`/portfolio`** と **`/portfolio/*`** に `X-Robots-Tag: noindex, nofollow, noarchive` |
| `public/robots.txt` | `GPTBot` / `Google-Extended` 向け `Disallow: /portfolio` を追加 |
| `.github/workflows/deploy-cloudflare-pages.yml` | **新規**（Pages デプロイ + コメント修正）。旧 `deploy-pages.yml` は削除 |
| `README.md` | Pages 本番・ワークフローパス・Basic 廃止・手動ダッシュボード手順 |
| `AGENTS.md` / `CLAUDE.md` | Basic / `PREVIEW_SECRET` の記述を現状に合わせる |
| `.dev.vars.example` | `PREVIEW_SECRET` 行を削除（または「廃止」と一行） |
| `docs/requirements.md` | 認証前提の robots 文言を **no auth + meta + ヘッダ** に更新 |
| `docs/superpowers/specs/2026-04-13-portfolio-pages-static-no-auth-design.md` | **Status:** Approved (2026-04-13) に更新 |

---

### Task 1: ミドルウェア削除と `env.d.ts` 整理

**Files:**

- Delete: `src/middleware.ts`
- Modify: `env.d.ts`

- [ ] **Step 1: `src/middleware.ts` を削除**

```bash
cd /Users/kazkiueda/Sources/github.com/themeaningof8/kazkiueda_com
rm src/middleware.ts
```

- [ ] **Step 2: `env.d.ts` を次の内容に置き換え**（ファイル全体）

```typescript
/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** ポートフォリオの連絡先メール（未設定時はページ側のフォールバック） */
  readonly PUBLIC_CONTACT_EMAIL?: string;
  readonly PUBLIC_INSTAGRAM_URL?: string;
  readonly PUBLIC_LINKEDIN_URL?: string;
  readonly PUBLIC_DRIBBBLE_URL?: string;
}
```

- [ ] **Step 3: 検証**

```bash
bun run check
```

期待: ミドルウェア削除後も型チェックが通る（`cloudflare:workers` を参照するファイルが無いこと）。

- [ ] **Step 4: コミット**

```bash
git add src/middleware.ts env.d.ts
git commit -m "chore: remove portfolio Basic auth middleware"
```

（`src/middleware.ts` は `git add -A` または削除をステージ）

---

### Task 2: `astro.config.mjs` を静的＋ルートリダイレクトに変更

**Files:**

- Modify: `astro.config.mjs`
- Delete: `src/pages/index.astro`

- [ ] **Step 1: `astro.config.mjs` を次の内容に置き換え**（ファイル全体）

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  redirects: {
    '/': {
      status: 302,
      destination: '/portfolio',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 2: `src/pages/index.astro` を削除**（redirect は `astro.config` が担当）

```bash
rm src/pages/index.astro
```

- [ ] **Step 3: 検証**

```bash
bun run check
bun run build
```

期待: **`bun run build`** が成功し、`dist` に **`/portfolio/index.html`** 等が生成される。ルート `/` はホスト側のリダイレクト設定または Astro が生成するリダイレクトメタに依存するため、**Task 8** 後に `pages:dev` で **`/` が `/portfolio` に飛ぶ**ことを確認する。

- [ ] **Step 4: コミット**

```bash
git add astro.config.mjs src/pages/index.astro
git commit -m "feat: static output and root redirect to /portfolio"
```

---

### Task 3: `/portfolio` 一覧を prerender

**Files:**

- Modify: `src/pages/portfolio/index.astro`（先頭の frontmatter のみ）

- [ ] **Step 1: 先頭 2 行を次に変更**

置換前:

```astro
---
export const prerender = false;
```

置換後:

```astro
---
export const prerender = true;
```

- [ ] **Step 2: 検証**

```bash
bun run check
bun run build
```

期待: ビルドログにオンデマンド用の server bundle が不要であることが分かる（エラーなし）。

- [ ] **Step 3: コミット**

```bash
git add src/pages/portfolio/index.astro
git commit -m "fix: prerender portfolio index for static hosting"
```

---

### Task 4: `@astrojs/cloudflare` を外す

**Files:**

- Modify: `package.json`

- [ ] **Step 1: 依存削除**

```bash
cd /Users/kazkiueda/Sources/github.com/themeaningof8/kazkiueda_com
bun remove @astrojs/cloudflare
```

- [ ] **Step 2: `package.json` の `scripts` を次の方針で手編集**

- `"deploy": "bun run deploy:cf-worker"` を **`"deploy": "bun run deploy:pages"`** に変更。
- **`deploy:cf-worker`** 行は削除するか、コメントで「廃止: 本番は Pages」と残すかは好み。**推奨:** `deploy:cf-worker` を削除し、`deploy:pages` のみ残す。

`deploy:pages` の値（既存を維持）:

```json
"deploy:pages": "bun run build && bunx wrangler pages deploy ./dist --project-name=kazkiueda-com"
```

- [ ] **Step 3: 検証**

```bash
bun install --frozen-lockfile
bun run check
bun run build
```

期待: **`bun run build`** 成功、`node_modules` から `@astrojs/cloudflare` が消えている。

- [ ] **Step 4: コミット**

```bash
git add package.json bun.lock
git commit -m "chore: drop Cloudflare adapter; default deploy to Pages"
```

---

### Task 5: `public/_headers` と `public/robots.txt`

**Files:**

- Create: `public/_headers`
- Modify: `public/robots.txt`

- [ ] **Step 1: `public/_headers` を新規作成**（ファイル全体）

Cloudflare Pages の [Headers 形式](https://developers.cloudflare.com/pages/configuration/headers/):

```
/portfolio
  X-Robots-Tag: noindex, nofollow, noarchive

/portfolio/*
  X-Robots-Tag: noindex, nofollow, noarchive
```

（パス行の直後のヘッダ行は先頭スペース 2 つでインデント。ブロックの間は空行 1 行。）

- [ ] **Step 2: `public/robots.txt` を次の内容に置き換え**（ファイル全体）

```
# https://kazkiueda.com — /portfolio をクローラーに載せない・読ませない方針
User-agent: *
Disallow: /portfolio

User-agent: GPTBot
Disallow: /portfolio

User-agent: Google-Extended
Disallow: /portfolio
```

- [ ] **Step 3: 検証**

```bash
bun run build
grep -n "X-Robots-Tag" dist/_headers || grep -n "X-Robots-Tag" dist/.headers 2>/dev/null || ls dist | head
```

期待: `dist` に **`_headers`** がコピーされている（ファイル名は **`_headers`**）。Astro が `public/` をそのままコピーするため **`dist/_headers`** に存在する。

```bash
test -f dist/_headers && grep -q "X-Robots-Tag" dist/_headers && echo OK
```

- [ ] **Step 4: コミット**

```bash
git add public/_headers public/robots.txt
git commit -m "feat: add X-Robots-Tag headers and bot rules for /portfolio"
```

---

### Task 6: `wrangler.jsonc` 簡素化

**Files:**

- Modify: `wrangler.jsonc`

- [ ] **Step 1: `wrangler.jsonc` を次の内容に置き換え**（Workers `main` / `assets` / observability を削除）

```json
{
	"$schema": "node_modules/wrangler/config-schema.json",
	"name": "kazkiueda",
	"compatibility_date": "2026-04-11"
}
```

- [ ] **Step 2: 検証**

```bash
npx --yes wrangler@4.81.1 whoami
```

期待: ログイン済みトークンがあればアカウント表示（CI と同様）。

- [ ] **Step 3: コミット**

```bash
git add wrangler.jsonc
git commit -m "chore: simplify wrangler config for Pages-only deploys"
```

---

### Task 7: GitHub Actions を Pages デプロイに差し替え

**Files:**

- Create: `.github/workflows/deploy-cloudflare-pages.yml`
- Delete: `.github/workflows/deploy-pages.yml`

- [ ] **Step 1: 新規ワークフロー `.github/workflows/deploy-cloudflare-pages.yml`**

```yaml
# Cloudflare Pages へ本番デプロイ（GitHub Actions）
# 静的 `dist` を `wrangler pages deploy` でアップロードする。
# Secrets: CLOUDFLARE_API_TOKEN（Account / Cloudflare Pages へのデプロイ権限）, CLOUDFLARE_ACCOUNT_ID

name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: cloudflare-pages-deploy
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
    permissions:
      contents: read

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version-file: .bun-version

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build
        run: bun run build

      - name: Preflight (Cloudflare API)
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          set -euo pipefail
          export CLOUDFLARE_API_TOKEN="$(printf '%s' "$CLOUDFLARE_API_TOKEN" | tr -d '\r\n')"
          export CLOUDFLARE_ACCOUNT_ID="$(printf '%s' "$CLOUDFLARE_ACCOUNT_ID" | tr -d '\r\n')"
          echo "CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID"
          npx --yes wrangler@4.81.1 whoami

      - name: Deploy to Cloudflare Pages
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          set -euo pipefail
          export CLOUDFLARE_API_TOKEN="$(printf '%s' "$CLOUDFLARE_API_TOKEN" | tr -d '\r\n')"
          export CLOUDFLARE_ACCOUNT_ID="$(printf '%s' "$CLOUDFLARE_ACCOUNT_ID" | tr -d '\r\n')"
          npx --yes wrangler@4.81.1 pages deploy ./dist --project-name=kazkiueda-com
```

- [ ] **Step 2: 旧 `deploy-pages.yml` を削除**

```bash
rm .github/workflows/deploy-pages.yml
```

- [ ] **Step 3: ローカルでビルドのみ再確認**

```bash
bun run build
```

- [ ] **Step 4: コミット**

```bash
git add .github/workflows/deploy-cloudflare-pages.yml .github/workflows/deploy-pages.yml
git commit -m "ci: deploy static dist to Cloudflare Pages"
```

---

### Task 8: ドキュメントと仕様ステータス

**Files:**

- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`
- Modify: `.dev.vars.example`
- Modify: `docs/requirements.md`
- Modify: `docs/superpowers/specs/2026-04-13-portfolio-pages-static-no-auth-design.md`

- [ ] **Step 1: README の整合**

次を満たすように編集する（具体的な文面は実装者が既存トーンに合わせて書き換えよ）:

- 本番は **Cloudflare Pages**（ワークフローは **`.github/workflows/deploy-cloudflare-pages.yml`**）。
- **`PREVIEW_SECRET` / Basic 認証は廃止**したこと。
- **手動チェックリスト:** Cloudflare で **同名の Pages プロジェクト `kazkiueda-com`** が存在すること、**カスタムドメイン**が Pages 側に付いていること、**旧 Worker が同じホスト名で生きている場合は無効化またはルート解除**すること。

- [ ] **Step 2: `AGENTS.md`**

`/portfolio` の説明から **`PREVIEW_SECRET` ゲート**を削除し、**`noindex` + `robots.txt` + `_headers`** の方針を一行で補足。

- [ ] **Step 3: `CLAUDE.md`**

Basic 共有パスワード前提の文を、**URL 共有のみ・認証なし**に更新。

- [ ] **Step 4: `.dev.vars.example`**

`PREVIEW_SECRET=...` 行を削除。`PUBLIC_*` の例のみ残す。

- [ ] **Step 5: `docs/requirements.md`**

「認証後に返す HTML」など **Basic 前提**の箇所を、**認証なし**でも **`meta` と一致する `X-Robots-Tag`** と **`robots.txt`** で満たす旨に置換。

- [ ] **Step 6: 設計 spec のステータス**

`docs/superpowers/specs/2026-04-13-portfolio-pages-static-no-auth-design.md` の先頭 **Status** を次に変更:

```markdown
**Status:** Approved (2026-04-13).
```

- [ ] **Step 7: コミット**

```bash
git add README.md AGENTS.md CLAUDE.md .dev.vars.example docs/requirements.md docs/superpowers/specs/2026-04-13-portfolio-pages-static-no-auth-design.md
git commit -m "docs: align for Pages static deploy without Basic auth"
```

---

### Task 9: 最終検証と手動ヘッダ確認

**Files:** なし（コマンドのみ）

- [ ] **Step 1: 型とビルド**

```bash
cd /Users/kazkiueda/Sources/github.com/themeaningof8/kazkiueda_com
bun run check
bun run build
```

期待: どちらも exit code 0。

- [ ] **Step 2: Pages ローカルサーバ**

別ターミナルで:

```bash
bun run pages:dev
```

期待: サーバ起動後、`curl -sI http://127.0.0.1:8788/portfolio/`（ポートは wrangler の表示に合わせる）で **`X-Robots-Tag: noindex, nofollow, noarchive`** が返る。

- [ ] **Step 3: ルートリダイレクト**

```bash
curl -sI http://127.0.0.1:8788/ | head -n 5
```

期待: **`302`** と **`Location: /portfolio`** または相対パス（環境依存）。

- [ ] **Step 4: （任意）コミット**

変更が無ければスキップ。ドキュメント追記だけならそのコミットを含む。

---

## Plan self-review（仕様との対応）

| Spec 節 | 対応タスク |
|---------|------------|
| §1 Recruiter UX / Basic 除去 | Task 1 |
| §1 静的・`/`・`/portfolio` | Task 2, 3 |
| §1 Crawl 多層 | Task 5（`_headers` + `robots.txt`）、Task 3 後の `PortfolioLayout` は既存のまま |
| §3 デプロイ Pages | Task 7 |
| §3 wrangler / scripts | Task 4, 6 |
| §3 adapter / session | Task 2, 4 |
| §3 middleware | Task 1 |
| §5 CI/CD・ドキュメント | Task 7, 8 |
| §6 検証 | Task 9 |
| §6 ロールバック | 本プラン Task 7 の「旧 workflow を復元する revert」で文書化済み（実行者メモに残す） |

**Placeholder scan:** 上記に「TBD」「後で」は置いていない。`README` の手動文は「実装者が具体文を書く」指示のみ。

**型・名前の整合:** `--project-name=kazkiueda-com` は **`package.json`** の `deploy:pages` と一致させる。

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-13-portfolio-pages-static-no-auth-plan.md`. Two execution options:**

1. **Subagent-Driven（推奨）** — タスクごとに新しいサブエージェントを投げ、タスク間でレビューしつつ高速に回す  
2. **Inline Execution** — このセッションで `executing-plans` に沿ってまとめて実行し、チェックポイントで止める  

**どちらで進めますか？**（未指定なら、こちらからは **1（Subagent-Driven）** を推奨します。）

---

**内部:** 次はユーザーの実行方式の返答を待つ。`writing-plans` の後は実装スキルはユーザー選択まで起動しない。


TodoWrite