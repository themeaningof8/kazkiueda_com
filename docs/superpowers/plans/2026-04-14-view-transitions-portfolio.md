# View Transitions（ポートフォリオ）実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `docs/superpowers/specs/2026-04-14-view-transitions-design.md` に沿い、一覧→詳細で **ルート View Transition** と **`transition:name` 共有要素（ヒーロー画像）** が一貫して動く状態にする（現状一覧に画像がないため共有要素が成立していないギャップを解消する）。

**Architecture:** `PortfolioLayout` の `<ClientRouter />` は据え置き。`transition:name` は **`case-hero-${entry.id}`** を一覧の `Image` と詳細の `Image` で共有する。ルートの `::view-transition-*` チューンは **`src/styles/styles.css` に集約**し、slug ごとの `::view-transition-group(case-hero-*)` CSS は追加しない。自動テストは置かず、**手動検証**で成功条件を満たす。

**Tech Stack:** Astro 6（静的）、`astro:transitions` / `ClientRouter`、`astro:assets` の `Image`、Tailwind v4（`src/styles/styles.css`）。

**Spec:** `docs/superpowers/specs/2026-04-14-view-transitions-design.md`

---

## ファイル構成（変更予定）

| ファイル | 責務 |
|----------|------|
| `src/components/portfolio/portfolio-types.ts` | `CaseStudy` に一覧用ヒーロー画像・alt・`transitionName` を追加 |
| `src/pages/portfolio/index.astro` | `getCollection` の各エントリから `heroImage` / `heroAlt` / `transitionName` を渡す（いま除外しているフィールドを復帰） |
| `src/components/portfolio/PortfolioCaseStudy.astro` | `href` がある行にサムネイル `Image` と `transition:name` を描画（`preset` に応じた `aspect-*` は詳細と同じ表をコピー） |
| `src/styles/styles.css` | `::view-transition-*` ブロック直上に **設計 spec への参照コメント** を追加（挙動は原則維持） |
| `src/pages/portfolio/work/[slug].astro` | 変更不要の想定（既存 `case-hero-${entry.id}`）。変更が入った場合は本計画の検証手順を再実行 |

---

### Task 1: `CaseStudy` 型に一覧用ヒーロー情報を足す

**Files:**

- Modify: `src/components/portfolio/portfolio-types.ts`

- [ ] **Step 1: 型を拡張する**

`astro` の `ImageMetadata` を import し、`CaseStudy` に次を追加する（いずれも **optional** でよいが、`href` 付き一覧では常に埋める想定）。

```typescript
import type { ImageMetadata } from 'astro';

export interface CaseStudy {
  // ...既存フィールド...
  /** 一覧サムネイル（詳細ヒーローと同一アセット推奨） */
  heroImage?: ImageMetadata;
  heroAlt?: string;
  /** View Transitions 共有要素名（例: `case-hero-${entry.id}`） */
  transitionName?: string;
}
```

- [ ] **Step 2: 型チェック**

Run: `bun run check`  
Expected: 0 errors（この時点では呼び出し側未更新でエラーになる場合は Task 2 とまとめて直してよい）。

- [ ] **Step 3: コミット**

```bash
git add src/components/portfolio/portfolio-types.ts
git commit -m "feat(portfolio): extend CaseStudy type for hero VT on listing"
```

---

### Task 2: 一覧ページからヒーロー画像と `transitionName` を渡す

**Files:**

- Modify: `src/pages/portfolio/index.astro`

- [ ] **Step 1: `map` 内で `heroImage` / `heroAlt` を捨てない**

現状:

```typescript
const { heroImage: _, heroAlt: __, order: ___, summaryRows: ____, ...listing } = entry.data;
```

をやめ、`order` / `summaryRows` だけ除外し、`heroImage` / `heroAlt` を `listing` に残す（または明示スプレッド）。

加えて次を付与する:

```typescript
transitionName: `case-hero-${entry.id}`,
```

- [ ] **Step 2: ビルド確認**

Run: `bun run build`  
Expected: 成功（`PortfolioCaseStudy` 未対応なら型/未使用プロパティ警告のみの可能性あり → Task 3 で解消）。

- [ ] **Step 3: コミット**

```bash
git add src/pages/portfolio/index.astro
git commit -m "feat(portfolio): pass hero image and transition name to listing"
```

---

### Task 3: `PortfolioCaseStudy` にサムネイル `Image` と `transition:name` を描画する

**Files:**

- Modify: `src/components/portfolio/PortfolioCaseStudy.astro`

**参照:** `src/pages/portfolio/work/[slug].astro` の `layoutMeta` / `L.aspect` と同一の `preset` → `aspect-*` 対応表を、`PortfolioCaseStudy` の frontmatter に小さな `const layoutMeta = { ... } as const` として複製する（DRY より YAGNI。共通化するなら別タスク）。

- [ ] **Step 1: import と props 分割**

```astro
---
import { Image } from 'astro:assets';
// ...既存 import
const {
  // 既存
  heroImage,
  heroAlt,
  transitionName,
} = Astro.props;
---
```

- [ ] **Step 2: `href` 分岐のレイアウトにサムネイル列を追加**

条件: `href && heroImage && heroAlt && transitionName` のときだけ、`flex` 行の **左（連番の右）または右カラム先頭** に次のようなブロックを置く（幅は `w-[140px]` 前後の `shrink-0`、`rounded-lg overflow-hidden border border-border-subtle` 等、既存カードトーンに合わせる）。

```astro
<div class:list={['relative shrink-0 overflow-hidden rounded-lg border border-border-subtle', aspectClass]}>
  <Image
    src={heroImage}
    alt={heroAlt}
    width={320}
    height={200}
    class="h-full w-full object-cover"
    sizes="(min-width: 768px) 200px, 40vw"
    transition:name={transitionName}
  />
</div>
```

`aspectClass` は `preset` から `layoutMeta[preset].aspect` を参照して付与する。

- [ ] **Step 3: フォールバック**

`heroImage` が欠けるエントリでも一覧が壊れないように、画像ブロックは **条件付きのみ** 表示（`href` のみで画像なしのケースは従来レイアウト）。

- [ ] **Step 4: チェックとビルド**

Run:

```bash
bun run check && bun run build
```

Expected: ともに成功。

- [ ] **Step 5: コミット**

```bash
git add src/components/portfolio/PortfolioCaseStudy.astro
git commit -m "feat(portfolio): listing hero thumb with shared transition name"
```

---

### Task 4: `styles.css` に spec 参照コメントを置く

**Files:**

- Modify: `src/styles/styles.css`（`@media (prefers-reduced-motion: no-preference)` 内の `::view-transition-old(root)` ブロックの直前）

- [ ] **Step 1: コメントを挿入**

```css
/* View Transitions: ルートのみ明示チューン。設計・検証手順は
   docs/superpowers/specs/2026-04-14-view-transitions-design.md を参照。
   共有要素は transition:name（case-hero-<id>）に任せ、slug ごとの
   ::view-transition-group(case-hero-*) は定義しない。 */
```

- [ ] **Step 2: コミット**

```bash
git add src/styles/styles.css
git commit -m "docs(css): link View Transition rules to design spec"
```

---

### Task 5: 手動検証（成功条件）

本計画では **E2E を追加しない**（spec §6）。

- [ ] **Step 1: Chrome で確認**

1. `/portfolio` を開く。各ケースで **サムネイルが表示**され、CLS が許容範囲であること。  
2. サムネイル付近で **「ケーススタディを見る」** から詳細へ遷移。DevTools → Elements → `::view-transition` オーバーレイで **ルート + 画像** の遷移が走ること。  
3. 詳細ヒーローと一覧サムネの **同一 `transition:name`** を DevTools の属性で確認。

- [ ] **Step 2: Firefox / Safari で往復**

一覧 → 詳細 → 戻る（ブラウザバック）を 1 往復ずつ。致命的なちらつきなし。

- [ ] **Step 3: Reduced motion**

OS 設定で視覚効果を減らす / `prefers-reduced-motion` をオンにし、**ルート VT が実質オフ**（既存 CSS）であること。

- [ ] **Step 4: メモ**

問題なしなら簡単なメモを PR 本文またはコミットメッセージに残す（必須ではない）。

---

## 計画の自己レビュー（対 spec）

| Spec 節 | 対応タスク |
|---------|------------|
| §2 スコープ（ClientRouter・root・transition:name・reduce） | Task 1–5 |
| §3.1 ルート CSS 集約 | Task 4（コメント）＋既存ルール維持 |
| §3.2 共有要素・per-slug CSS 禁止 | Task 3（マークアップのみ）／`::view-transition-group(case-hero-*)` は追加しない |
| §3.3 reduce とグローバル `*` | 変更なし。Task 4 で文書化 |
| §5 成功条件 | Task 5 |
| §6 検証 | Task 5 |
| §7 対応表 | Task 1–3 で `transition:name` を一覧に追加し詳細と整合 |

**Placeholder スキャン:** なし。

---

## 実行の引き継ぎ

Plan complete and saved to `docs/superpowers/plans/2026-04-14-view-transitions-portfolio.md`. Two execution options:

**1. Subagent-Driven (recommended)** — タスクごとに新しいサブエージェントを投げ、タスク間でレビューする。速い反復向け。

**2. Inline Execution** — このセッションで `executing-plans` に沿い、チェックポイント付きでまとめて実行する。

**Which approach?**
