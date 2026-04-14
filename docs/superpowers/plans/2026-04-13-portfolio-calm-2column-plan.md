# Portfolio Page (Calm 2-column) parity — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Paper の `Portfolio Page (Calm 2-column)` に沿って `/portfolio` を一覧中心レイアウトに作り替え、`/about` を追加し、全サイトから連絡・`mailto:` 導線を取り除く。

**Architecture:** 一覧・`/about` 共通の **固定コンパクトヘッダ**（氏名＋「ポートフォリオ」、`About`→`/about`）を新設し、`PortfolioLayout` の描画優先度を `caseStudyDetailHeader` → **`portfolioListingHeader`** → `topNav` とする。ケースカードは既存 `CaseStudy` データを **`PortfolioCaseStudy` を Calm 用に改修**（左画像・右テキスト固定、ジグザグ廃止）して表示する。検証は `bun run check` / `bun run build` と `rg` で連絡導線の欠落を確認する。

**Tech Stack:** Astro 6、Tailwind CSS v4、既存 `astro:content` / `getImage`、View Transitions（既存）

---

## File map

| Path | Action |
|------|--------|
| `src/components/portfolio/portfolio-types.ts` | `PortfolioListingHeaderProps` を追加 |
| `src/components/portfolio/PortfolioListingHeader.astro` | **新規** — 一覧／About 用ヘッダ（`border-b` なし、`About` のみ） |
| `src/layouts/PortfolioLayout.astro` | `portfolioListingHeader` prop と描画分岐を追加 |
| `src/pages/portfolio/index.astro` | Hero／About／Contact 削除、新ヘッダ、ケーススタディ見出し、フッター維持、`topNav` 廃止 |
| `src/components/portfolio/PortfolioCaseStudy.astro` | Calm 2-column（常に左画像・右テキスト、巨大プリセット水玉は Paper に合わせて縮小または左端小ラベル化） |
| `src/pages/about.astro` | **新規** — `PortfolioLayout` + `portfolioListingHeader` + 短文プロフィール |
| `src/pages/portfolio/work/[slug].astro` | `caseStudyDetailHeader.aboutHref` を `/about` に変更（`/portfolio#about` をやめる） |
| `src/components/portfolio/PortfolioTopNav.astro` | 当面残すが **一覧では非使用**（他用途が無ければ後続で整理可） |

---

### Task 1: 型と `PortfolioListingHeader` と `PortfolioLayout`

**Files:**
- Modify: `src/components/portfolio/portfolio-types.ts`
- Create: `src/components/portfolio/PortfolioListingHeader.astro`
- Modify: `src/layouts/PortfolioLayout.astro`

- [ ] **Step 1: 型を追加**

`portfolio-types.ts` に次を追加する。

```typescript
/** Paper「Portfolio Page」一覧用のコンパクトヘッダ */
export interface PortfolioListingHeaderProps {
  brand: string;
  /** ヘッダ2行目（例: 「ポートフォリオ」） */
  tagline: string;
  aboutHref: string;
  aboutLabel?: string;
}
```

- [ ] **Step 2: `PortfolioListingHeader.astro` を新規作成**

`CaseStudyDetailHeader.astro` と同様の **固定**・**横 max 1440 / インセット 72px**・**下線なし**。左に `brand`（小さめ muted）と `tagline`（強調）。右に `About` リンク（`hover:underline` は付けない — 仕様どおり静かに。フォーカスリングは維持）。

```astro
---
import type { PortfolioListingHeaderProps } from './portfolio-types';
type Props = PortfolioListingHeaderProps;
const { brand, tagline, aboutHref, aboutLabel = 'About' } = Astro.props;
---
<header class="fixed inset-x-0 top-0 z-50 bg-surface-canvas" role="banner">
  <div class="mx-auto max-w-[1440px] px-6 lg:px-[72px]">
    <div class="flex min-h-[50px] items-center justify-between gap-4 py-2">
      <div class="min-w-0 flex-1">
        <p class="truncate text-xs text-fg-muted">{brand}</p>
        <p class="truncate text-sm font-semibold text-fg-strong md:text-base">{tagline}</p>
      </div>
      <a
        href={aboutHref}
        class="shrink-0 rounded-md text-sm font-medium text-accent outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        {aboutLabel}
      </a>
    </div>
  </div>
</header>
```

- [ ] **Step 3: `PortfolioLayout` を拡張**

`Props` に `portfolioListingHeader?: PortfolioListingHeaderProps` を追加。描画順序:

1. `caseStudyDetailHeader` があれば `CaseStudyDetailHeader`
2. なければ `portfolioListingHeader` があれば `PortfolioListingHeader`
3. それもなければ `topNav` があれば `PortfolioTopNav`

ファイル先頭に `import PortfolioListingHeader from '...'` を追加。テンプレートの分岐を上記のとおり置き換える。

- [ ] **Step 4: 検証**

Run: `bun run check`  
Expected: エラーなし。

- [ ] **Step 5: Commit**

メッセージ例: `feat(portfolio): add listing header component and layout slot`

---

### Task 2: `/portfolio` ページの組み替え

**Files:**
- Modify: `src/pages/portfolio/index.astro`

- [ ] **Step 1: import の整理**

次を **削除**: `PortfolioHero`、`PortfolioAbout`、`PortfolioContact`。`PortfolioTopNav` 経由の `topNav` 定数も削除。

- [ ] **Step 2: `portfolioListingHeader` を渡す**

```typescript
const portfolioListingHeader = {
  brand: '植田 一貴',
  tagline: 'ポートフォリオ',
  aboutHref: '/about',
} satisfies PortfolioListingHeaderProps;
```

`<PortfolioLayout title="Portfolio | kazkiueda.com" portfolioListingHeader={portfolioListingHeader}>` のように渡す（`topNav` は渡さない）。

- [ ] **Step 3: `main` の構造**

- 外側: `max-w-[1440px] px-6 lg:px-[72px]`（仕様のインセット）。
- 固定ヘッダ分の `padding-top`（例: `pt-24` または `pt-28`）を維持・調整。
- **単一の `h1`:** スクリーンリーダー向けに `sr-only` の「植田 一貴のポートフォリオ」など **1つだけ**。または視覚的な `h1` をヘッダ外の main 先頭に置く — いずれか **重複 `h1` 禁止**（仕様 §8）。
- **`h2`:** 「ケーススタディ」セクション見出し（旧 `Selected Works` を置換）。
- `section` の `id="work"` は、外部リンクが無ければ省略可。残す場合は `scroll-mt` のみ維持。

- [ ] **Step 4: ケース一覧**

`caseStudies.map((study) => <PortfolioCaseStudy {...study} />)` は維持。`navItems` / `CaseStudyNavItem` は **一覧では不要** — `portfolioListingHeader` だけなので、`navItems` 変数と `sorted` からの nav 用マッピングを削除してよい。

- [ ] **Step 5: フッター**

`PortfolioFooter` はそのまま。`footerLinks` は SNS のみ（メールを渡さない）。

- [ ] **Step 6: 検証**

Run: `bun run check && bun run build`  
Expected: 成功。

- [ ] **Step 7: Commit**

メッセージ例: `feat(portfolio): rebuild listing page with calm shell`

---

### Task 3: `PortfolioCaseStudy` を Calm 2-column に統一

**Files:**
- Modify: `src/components/portfolio/PortfolioCaseStudy.astro`

- [ ] **Step 1: ジグザグ削除**

`reverse` と `rowIndex` による `order` / `col-start` の切替を **削除**。常に **左カラム＝画像**、**右カラム＝テキスト**（`lg:` で2カラム。狭い画面は **上に画像、下にテキスト** でよい）。

- [ ] **Step 2: 装飾の整理**

背景の巨大 `preset` 数字（`numberClass`）は Paper に合わせ **カード左上の小さな番号**（例: `text-xs tabular-nums text-fg-muted`）に変更するか、画像オーバーレイの一角に移す。仕上げは Task 7 で Paper と突き合わせる。

- [ ] **Step 3: グリッド**

Paper の比率に近づけるため、PC では **画像列幅 ~554px 相当** を目安に `lg:grid-cols-[minmax(0,554px)_minmax(0,1fr)]` または `flex` + 固定幅を使う（正確な px は Paper レビューで調整）。

- [ ] **Step 4: `sectionId` と `scroll-mt`**

一覧にアンカーナビが無いなら `id={sectionId}` と `scroll-mt-*` は **削除してよい**。`aria-labelledby` は見出し `h3` を維持。

- [ ] **Step 5: 検証**

Run: `bun run check && bun run build`  
Expected: 成功。

- [ ] **Step 6: Commit**

メッセージ例: `feat(portfolio): unify case study cards to calm 2-column layout`

---

### Task 4: `/about` ページ

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: ページを追加**

```astro
---
export const prerender = true;
import PortfolioLayout from '../layouts/PortfolioLayout.astro';
import type { PortfolioListingHeaderProps } from '../components/portfolio/portfolio-types';

const portfolioListingHeader = {
  brand: '植田 一貴',
  tagline: 'ポートフォリオ',
  aboutHref: '/about',
} satisfies PortfolioListingHeaderProps;
---
<PortfolioLayout title="About | kazkiueda.com" portfolioListingHeader={portfolioListingHeader}>
  <main id="main-content" class="mx-auto min-w-0 max-w-[720px] px-6 pb-32 pt-28 md:px-12 md:pt-32">
    <h1 class="text-2xl font-bold tracking-tight text-fg-strong md:text-3xl">About</h1>
    <div class="prose prose-neutral prose-lg mt-8 max-w-none text-fg-muted">
      <p>（ここに既存 PortfolioAbout の intro 段落から1〜2段落を転記。連絡先は書かない）</p>
    </div>
  </main>
</PortfolioLayout>
```

実装時は **実文**を `index.astro` 以前の `aboutIntroParagraphs` からコピーし、プレースホルダ文は残さない。

- [ ] **Step 2: About リンクの自己参照**

ヘッダの `About` は現在ページ — `aria-current="page"` を付けるか、スタイルを muted にするかは実装計画の任意改善（必須ではない）。

- [ ] **Step 3: 検証**

Run: `bun run check && bun run build`  
Expected: `/about/index.html` が生成される。

- [ ] **Step 4: Commit**

メッセージ例: `feat(pages): add minimal about page`

---

### Task 5: ケーススタディ詳細の About URL

**Files:**
- Modify: `src/pages/portfolio/work/[slug].astro`

- [ ] **Step 1: `aboutHref` を修正**

`caseStudyDetailHeader` 内を次のようにする。

```typescript
aboutHref: '/about',
```

- [ ] **Step 2: 検証**

Run: `bun run check && bun run build`  
Expected: 成功。

- [ ] **Step 3: Commit**

メッセージ例: `fix(portfolio): point case study header About link to /about`

---

### Task 6: 連絡導線の削除確認

**Files:**
- リポジトリ全体（主に `src/`）

- [ ] **Step 1: grep**

Run:

```bash
rg 'mailto:|#contact|お問い合わせ|PortfolioContact' src/
```

Expected: **ヒットなし**（または使用されていないコンポーネント定義のみ）。残る場合は該当ファイルを Task 2〜5 で削除／参照解除する。

- [ ] **Step 2: 未使用 import**

`PortfolioContact` 等をどこからも import していなければ、コンポーネントファイルは **削除しなくてよい**（仕様の範囲外）。一覧に戻す必要がなければそのまま。

- [ ] **Step 3: Commit（必要時のみ）**

連絡系の残骸削除があればコミット。

---

### Task 7: Paper レビューループ（必須）

- [ ] **Step 1:** MCP `user-paper` で `Portfolio Page (Calm 2-column)` を参照し、ヘッダ・見出し・カード比率を比較する。

- [ ] **Step 2:** 差分を Tailwind / 構造で修正し、再確認する（最低1ループ）。

- [ ] **Step 3:** `bun run check && bun run build`

- [ ] **Step 4: Commit**

メッセージ例: `fix(portfolio): align listing page with Paper calm reference`

---

## Plan self-review

| Spec § | Task |
|--------|------|
| 一覧 Calm 2-column、ヘッダ、ケーススタディ見出し | Task 1–3 |
| 連絡・mailto なし | Task 2, 6 |
| `/about` 新設 | Task 4 |
| 詳細 About → `/about` | Task 5 |
| h1 単一 / h2 ケーススタディ | Task 2（実装で明示） |
| PC 優先、Paper ループ | Task 7 |
| データソース維持 | Task 2–3 |

Placeholder なし。

---

## Execution handoff

Plan saved to `docs/superpowers/plans/2026-04-13-portfolio-calm-2column-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** — Fresh subagent per task, review between tasks.

**2. Inline Execution** — Execute in this session using executing-plans with checkpoints.

Which approach?
