# Portfolio Stitch layout parity (Sage + Noto) — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `/portfolio` (and shared `PortfolioLayout` chrome) in line with `docs/stitch-ref/portfolio-home-updated/screen.html` for **layout, component shape, spacing, and hierarchy**, while keeping **Sage tokens + Noto only**, preserving **collections, detail routes, View Transitions, case-study rail + mobile dock nav, anchors, and IntersectionObserver highlighting**.

**Architecture:** Add **`PortfolioTopNav.astro`** (fixed top, Sage). **`PortfolioCaseStudyNav`**: rail unchanged in `#work`; **chips become `fixed bottom-0` dock** rendered **after `<main>`** on the listing page only, with **`padding-bottom` on `<main>`** (CSS var) so content clears the dock. **`PortfolioCaseStudy.astro`** becomes Stitch-like **12-column asymmetric rows** (odd/even) with **OUTCOME** + **role badge** from frontmatter. **`PortfolioHero`**, **`PortfolioAbout`**, **`PortfolioContact`**, **`PortfolioFooter`** adjusted for Stitch rhythm using existing tokens. **Detail pages** reuse layout + top nav with **absolute section links** (`/portfolio#work`, etc.).

**Tech Stack:** Astro 6, Tailwind v4, Content Collections (`astro/zod`), `astro:assets`, View Transitions (`ClientRouter` in `PortfolioLayout`).

**Verification:** `bun run check` and `bun run build` after each task group; manual checks from design spec §6.

**Spec reference:** `docs/superpowers/specs/2026-04-12-portfolio-stitch-layout-parity-design.md`  
**Reference HTML:** `docs/stitch-ref/portfolio-home-updated/screen.html`

---

## File map

| Path | 役割 |
|------|------|
| `src/components/portfolio/PortfolioTopNav.astro` | **新規。**固定トップバー。`work` / `about` / `contact` の `href` を **props で注入**（一覧は `#…`、詳細は `/portfolio#…`）。 |
| `src/layouts/PortfolioLayout.astro` | 先頭に `PortfolioTopNav` を差し込み、**オプション props** でナビ用 href と表示ラベルを受け取る。スキップリンクの `z-index` がトップナビと競合しないよう調整。 |
| `src/pages/portfolio/index.astro` | ヒーロー props、`#work` 見出し（視覚的）、レール + メイン列、**下端チップ**（`main` の外）、`main` の **`pb-[var(--portfolio-dock-h)]`** 等。 |
| `src/pages/portfolio/work/[slug].astro` | `PortfolioLayout` に **詳細用 href**（`/portfolio#work` 等）を渡す。 |
| `src/components/portfolio/PortfolioCaseStudyNav.astro` | **`variant="dock"`**（または `chips` の挙動変更）: **`fixed bottom-0 inset-x-0 z-40`**、帯スタイル。既存 `rail` と **同じ `get_screen` 由来の `data-case-anchor`**。 |
| `src/components/portfolio/PortfolioCaseStudy.astro` | Stitch 行レイアウト（`order` / `lg:col-start-*`）、OUTCOME、バッジ、背後番号、画像ホバー。 |
| `src/components/portfolio/PortfolioHero.astro` | 副行の **イタリック相当**・`tracking`・`max-w` を参照 HTML に寄せる **props / class 拡張**（後方互換）。 |
| `src/components/portfolio/PortfolioAbout.astro` | 2 カラム比率・余白・タグ行を参照 HTML に寄せる（**データ構造は維持**しつつマークアップ調整が主）。 |
| `src/components/portfolio/PortfolioContact.astro` | **全面 `bg-accent` + `text-fg-on-accent`** の CTA 帯 + 中央ボタン（`mailto:`）。 |
| `src/components/portfolio/PortfolioFooter.astro` | 必要なら **横並びのトーン**微調整（既存 `md:flex-row` を活かす）。 |
| `src/components/portfolio/portfolio-types.ts` | `CaseStudy` に `roleBadge`, `outcomeLabel`, `outcomeTitle`；**行インデックス** `rowIndex: number`（奇偶で反転）。 |
| `src/content.config.ts` | Zod に上記 3 フィールドを **必須**で追加（各 `.md` を同タスクで更新）。 |
| `src/content/case-studies/*.md` | 各エントリに **ダミー値**（Stitch HTML に近い日本語）を追加。 |
| `src/styles/portfolio.css` | `@theme` または `:root` に **`--portfolio-dock-h`**（例 `5.5rem`）、必要なら **`scroll-padding-top`** を html に付与するユーティリティ、**`@media (prefers-reduced-motion: reduce)`** で画像スケール抑制。 |

---

### Task 1: Content schema + Markdown + types

**Files:**

- Modify: `src/content.config.ts`
- Modify: `src/content/case-studies/ether-store.md`, `nexus-data.md`, `linear-studio.md`, `vera-finance.md`
- Modify: `src/components/portfolio/portfolio-types.ts`

- [ ] **Step 1: Zod に 3 フィールドを追加**（必須 `string`）

```typescript
roleBadge: z.string(),
outcomeLabel: z.string(),
outcomeTitle: z.string(),
```

- [ ] **Step 2: 各 Markdown の frontmatter**に、参照 HTML に近い例を入れる（英バッジでも日本語でも可。ビルドを通すことが先）:

```yaml
roleBadge: "Lead Designer"
outcomeLabel: "OUTCOME"
outcomeTitle: "開発効率の改善"
```

（4 ファイルで **内容は案件に合わせて変える**。）

- [ ] **Step 3: `CaseStudy` 型**に `roleBadge`, `outcomeLabel`, `outcomeTitle`, `rowIndex: number` を追加。`index.astro` の `map` で `rowIndex` を `0..n-1` で付与。

- [ ] **Step 4:** `bun run check` / `bun run build`

- [ ] **Step 5: コミット** `feat(content): extend case studies for Stitch parity fields`

---

### Task 2: `PortfolioTopNav.astro` + `PortfolioLayout` 配線

**Files:**

- Create: `src/components/portfolio/PortfolioTopNav.astro`
- Modify: `src/layouts/PortfolioLayout.astro`
- Modify: `src/pages/portfolio/index.astro`
- Modify: `src/pages/portfolio/work/[slug].astro`

- [ ] **Step 1: `PortfolioTopNav.astro` を新規作成**（抜粋 — 全文は実装時に補完）

```astro
---
interface Props {
  brand: string;
  workHref: string;
  aboutHref: string;
  contactHref: string;
  ctaHref: string;
  ctaLabel: string;
}
---
<header class="fixed inset-x-0 top-0 z-50 border-b border-border-subtle/60 bg-surface-canvas/80 backdrop-blur-md">
  <div class="mx-auto flex max-w-portfolio items-center justify-between gap-4 px-6 py-4 md:px-12">
    <a class="text-lg font-bold tracking-tight text-fg-strong" href={workHref.split('#')[0] || '/portfolio'}>{Astro.props.brand}</a>
    <nav class="hidden items-center gap-10 md:flex" aria-label="ページ内">
      <a class="text-sm font-medium text-fg-muted hover:text-fg-strong" href={Astro.props.workHref}>Work</a>
      <a class="text-sm font-medium text-fg-muted hover:text-fg-strong" href={Astro.props.aboutHref}>About</a>
      <a class="text-sm font-medium text-fg-muted hover:text-fg-strong" href={Astro.props.contactHref}>Contact</a>
    </nav>
    <a class="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-fg-on-accent hover:bg-accent-hover" href={Astro.props.ctaHref}>{Astro.props.ctaLabel}</a>
  </div>
</header>
```

`brand` のリンク先は **`/portfolio` 固定**でもよい（実装で調整）。

- [ ] **Step 2: `PortfolioLayout.astro`** に optional props を追加し、指定時のみ `PortfolioTopNav` を描画。

```astro
---
import PortfolioTopNav from '../components/portfolio/PortfolioTopNav.astro';
interface Props {
  title?: string;
  topNav?: {
    brand: string;
    workHref: string;
    aboutHref: string;
    contactHref: string;
    ctaHref: string;
    ctaLabel: string;
  };
}
---
{topNav ? <PortfolioTopNav {...topNav} /> : null}
<slot />
```

- [ ] **Step 3: `index.astro`** で `workHref="#work"`, `aboutHref="#about"`, `contactHref="#contact"`, `ctaHref="mailto:…"` または `#contact`。

- [ ] **Step 4: `[slug].astro`** で `workHref="/portfolio#work"` 等にする。

- [ ] **Step 5:** `bun run check` / `bun run build`

- [ ] **Step 6: コミット** `feat(portfolio): add fixed top navigation bar`

---

### Task 3: 下端固定チップ + `main` 下パディング + CSS 変数

**Files:**

- Modify: `src/components/portfolio/PortfolioCaseStudyNav.astro`
- Modify: `src/pages/portfolio/index.astro`
- Modify: `src/styles/portfolio.css`

- [ ] **Step 1:** `PortfolioCaseStudyNav` に **`variant="dock"`** を追加。マークアップは既存 `chips` を流用しつつ、ルート `<nav>` に `fixed bottom-0 left-0 right-0 z-40 border-t ...` を付与。**`md:hidden`** で **デスクトップでは非表示**（レールのみ）。

- [ ] **Step 2: `index.astro`** から **ヒーロー下の `md:hidden` チップブロックを削除**。`<main>` の class に **`pb-[max(5.5rem,env(safe-area-inset-bottom))]`** のように Tailwind 任意値、または **`pb-[var(--portfolio-dock-h)]`** と `@theme` の変数を併用。

- [ ] **Step 3: `portfolio.css`** に `--portfolio-dock-h: 5.5rem;`（実測で調整可）と、`html { scroll-padding-top: … }` を追加（トップバー高に合わせる。`4.5rem` から調整）。

- [ ] **Step 4:** `index.astro` の `<main>` に **`pt` をトップナビ分増やす**（例: `pt-28` → `pt-32` または `scroll-mt` との兼ね合いで調整）。

- [ ] **Step 5:** `bun run check` / `bun run build`

- [ ] **Step 6: コミット** `feat(portfolio): dock case study chips at viewport bottom`

---

### Task 4: `PortfolioCaseStudy.astro` — Stitch 行レイアウト

**Files:**

- Modify: `src/components/portfolio/PortfolioCaseStudy.astro`
- Modify: `src/pages/portfolio/index.astro`（`rowIndex` 伝搬のみの可能性）

- [ ] **Step 1:** `Props` に `rowIndex: number` と `roleBadge`, `outcomeLabel`, `outcomeTitle` を追加。

- [ ] **Step 2:** ルートを **`grid grid-cols-12`** の行にし、`rowIndex % 2 === 0` なら **画像 `lg:col-span-7` + テキスト `lg:col-span-4 lg:col-start-9`**、奇数行は **`order` + `lg:col-start-*`** で参照 HTML の **02/04 行**を再現。

- [ ] **Step 3:** **OUTCOME** ボックス: `rounded-lg border-l-4 border-accent bg-surface-ui p-4` 相当。`outcomeLabel` / `outcomeTitle` を表示。

- [ ] **Step 4:** **ロールバッジ**（`roleBadge`）を参照 HTML の **小さな pill** に近づける（`bg-accent text-fg-on-accent text-[0.65rem]` 等、**コントラストを維持**）。

- [ ] **Step 5:** 背後番号: **`staggered-number`** 相当を **Sage の極薄色**（`text-surface-ui-hover` + 低 opacity）で左右切替。

- [ ] **Step 6:** 画像: **グレースケール + hover でフルカラー + `scale-105`**。`@media (prefers-reduced-motion: reduce)` では **`transition-none` / `scale-100`**。

- [ ] **Step 7:** `bun run check` / `bun run build`

- [ ] **Step 8: コミット** `feat(portfolio): stitch-style asymmetric case study rows`

---

### Task 5: `#work` セクション見出し + `index` グリッド再構成

**Files:**

- Modify: `src/pages/portfolio/index.astro`

- [ ] **Step 1:** `#work` 内の **視覚見出し**を追加（`sr-only` の `h2` は維持し、**別要素で "Selected Works"** + **`w-12 h-1 bg-accent`**）。

- [ ] **Step 2:** メイン列内を **`space-y-32` 相当**（`gap-y-24 md:gap-y-32`）にし、**Stitch の縦リズム**に寄せる。

- [ ] **Step 3:** `bun run check` / `bun run build`

- [ ] **Step 4: コミット** `feat(portfolio): selected works section header and spacing`

---

### Task 6: `PortfolioHero` / `PortfolioAbout` / `PortfolioContact`

**Files:**

- Modify: `src/components/portfolio/PortfolioHero.astro`
- Modify: `src/components/portfolio/PortfolioAbout.astro`
- Modify: `src/components/portfolio/PortfolioContact.astro`
- Modify: `src/pages/portfolio/index.astro`（ヒーロー props）

- [ ] **Step 1: Hero** — 副行に **`italic`** + **`text-fg-muted/80`** 等、参照の **2 行リズム**に近づける。`titleAccent` を `<span class="italic …">` で包む。

- [ ] **Step 2: About** — `py` / `gap` / ポートレート **`aspect-square`**、タグを **flex wrap** の **outline 風**（`border border-border-default`）に変更しうる。既存 `introParagraphs` を活かす。

- [ ] **Step 3: Contact** — セクション全体を **`bg-accent text-fg-on-accent py-24`**、見出し + サブコピー + **`rounded-lg` の反転ボタン**（`bg-fg-on-accent text-accent` 相当: **`bg-surface-canvas text-accent`** など **コントラスト確保**）。

- [ ] **Step 4:** `index.astro` のヒーロー文言を **参照 HTML に近い日英**に更新（任意・コピーは後続でも可）。

- [ ] **Step 5:** `bun run check` / `bun run build`

- [ ] **Step 6: コミット** `feat(portfolio): align hero about contact with Stitch layout`

---

### Task 7: `IntersectionObserver` と `scroll-margin` の最終調整

**Files:**

- Modify: `src/components/portfolio/PortfolioCaseStudyNav.astro`
- Modify: `src/components/portfolio/PortfolioCaseStudy.astro`
- Modify: `src/styles/portfolio.css`

- [ ] **Step 1:** `dock` で **IO が効くこと**を確認。`rootMargin` は **下端 UI 分**だけ負のマージンを増やすなど微調整。

- [ ] **Step 2:** `PortfolioCaseStudy` の `scroll-mt-*` を **トップバー + dock** に合わせて更新（モバイルのみ大きめにするなど）。

- [ ] **Step 3:** 手動確認（spec §6）

- [ ] **Step 4: コミット** `fix(portfolio): scroll spy and scroll margins for dock + top nav`

---

## Spec coverage（自己チェック）

| Spec 節 | タスク |
|---------|--------|
| §1 ゴール・B 遵守 | 全タスク（色名禁止はコードレビューで再確認） |
| §3.1 トップバー | Task 2 |
| §3.2 ヒーロー | Task 6 |
| §3.3 Works | Task 4, 5 |
| §3.4 下端チップ | Task 3 |
| §3.5 About/Contact/Footer | Task 6 + Footer 微調整 |
| §4 frontmatter | Task 1 |
| §5 a11y / motion | Task 4, 7 |
| §6 テスト | 各 Task の check/build + Task 7 手動 |

**プレースホルダなし**（CTA は `mailto:${PUBLIC_CONTACT_EMAIL}` を既定と明記済み）。

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-12-portfolio-stitch-layout-parity-plan.md`. Two execution options:**

**1. Subagent-Driven（推奨）** — タスク単位でサブエージェントに実装させ、タスク間でレビューする。  
**2. Inline Execution** — このセッションで `executing-plans` に沿いチェックポイント付きで実装する。

**どちらで進めますか？**
