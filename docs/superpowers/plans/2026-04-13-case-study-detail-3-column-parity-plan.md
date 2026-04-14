# Case Study Detail (3-column) parity — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PC幅で `/portfolio/work/[slug]` を Paper の `Case Study Detail (3-column)` にほぼ忠実に合わせ、左目次・右関連事例の sticky、Paper 風ヘッダ、本文は既存 Markdown を維持する。

**Architecture:** 詳細ルート `src/pages/portfolio/work/[slug].astro` を3カラム専用 DOM に再構成する。`PortfolioLayout` は `PortfolioTopNav` の代わりに詳細専用ヘッダを差し込めるように拡張する。目次は Markdown 本文の `##` 見出しからビルドし、`rehype-slug` が付与する `id` と一致するよう `github-slugger` でスラッグを計算してリンクする。サマリー表は各 `.md` 先頭の表と文言を一致させるため、Zod の `summaryRows`（ラベル＋値の配列）へ移し、本文から該当の GFM 表ブロックを削除する（文言は変えない）。実装完了後は必ず Paper と突き合わせ、最低1回の修正ループを回す。

**Tech Stack:** Astro 6、Tailwind CSS v4、`astro:content`（Zod）、`@tailwindcss/typography`（既存）、`rehype-slug`、`github-slugger`

---

## File map (create / modify)

| Path | Responsibility |
|------|----------------|
| `package.json` | `rehype-slug`、`github-slugger` を dependencies に追加 |
| `astro.config.mjs` | `markdown.rehypePlugins` に `rehype-slug` |
| `src/content.config.ts` | `summaryRows` 必須フィールドを追加 |
| `src/content/case-studies/*.md` | サマリー表を frontmatter へ移し、本文から表を削除 |
| `src/lib/case-study-toc.ts`（新規） | Markdown から `##` を抽出し slug 化 |
| `src/layouts/PortfolioLayout.astro` | `caseStudyDetailHeader` 優先で描画 |
| `src/components/portfolio/portfolio-types.ts` | `CaseStudyDetailHeaderProps` 追加 |
| `src/components/portfolio/CaseStudyDetailHeader.astro`（新規） | Paper 風ヘッダ |
| `src/components/portfolio/CaseStudyDetailToc.astro`（新規） | 左レール |
| `src/components/portfolio/CaseStudyDetailRelated.astro`（新規） | 右レール |
| `src/components/portfolio/CaseStudyDetailTocScrollSpy.astro`（新規） | 目次ハイライト |
| `src/pages/portfolio/work/[slug].astro` | 3カラム・リード・ヒーロー・表・本文 |
| `src/styles/styles.css` またはページローカル class | `lg:` でカラム比率と sticky オフセット |

---

### Task 1: Markdown の見出し id とスラッグ基盤

**Files:** `package.json`, `astro.config.mjs`, `bun.lock`

- [ ] **Step 1:** `dependencies` に `rehype-slug` と `github-slugger` を追加する。
- [ ] **Step 2:** `astro.config.mjs` に `import rehypeSlug from 'rehype-slug'` を追加し、`markdown: { rehypePlugins: [rehypeSlug] }` を設定する（既存の `output` / `redirects` / `vite` は維持）。
- [ ] **Step 3:** Run `bun install && bun run check`。Expected: エラーなし。`rehype-slug` の import 形式がプロジェクトの解決と合わない場合は ESM/CJS に合わせて調整する。
- [ ] **Step 4:** Commit（メッセージ例: `chore: add rehype-slug and github-slugger for case study TOC`）。

---

### Task 2: コレクションスキーマとサマリー表の frontmatter 移行

**Files:** `src/content.config.ts`, `src/content/case-studies/scrum-master-decision-design.md`, `owners-app-proposal.md`, `design-system.md`

- [ ] **Step 1:** `src/content.config.ts` に必須フィールドを追加する。

```typescript
summaryRows: z.array(
  z.object({
    label: z.string(),
    value: z.string(),
  }),
),
```

- [ ] **Step 2:** 各 `.md` の既存 GFM 表の行をそのまま `summaryRows` に転記する（`design-system.md` は `役割` / `期間` / `技術スタック` の3行）。
- [ ] **Step 3:** 本文からサマリー表ブロックのみ削除する（`> 守秘義務` の引用と `##` 以降は維持）。
- [ ] **Step 4:** Run `bun run check && bun run build`。Expected: 成功。
- [ ] **Step 5:** Commit（メッセージ例: `feat(content): add summaryRows for case study summary tables`）。

---

### Task 3: 目次用ユーティリティ

**Files:** Create `src/lib/case-study-toc.ts`

- [ ] **Step 1:** 次のモジュールを実装する（フェンス内の `##` 誤検知が出たらフェンス対応を追加する）。

```typescript
import GithubSlugger from 'github-slugger';

export interface CaseStudyTocItem {
  text: string;
  slug: string;
}

export function tocFromMarkdownH2(body: string): CaseStudyTocItem[] {
  const slugger = new GithubSlugger();
  const items: CaseStudyTocItem[] = [];
  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    const m = /^##\s+(.+)$/.exec(trimmed);
    if (!m) continue;
    const text = m[1].trim();
    if (!text) continue;
    items.push({ text, slug: slugger.slug(text) });
  }
  return items;
}
```

- [ ] **Step 2:** Run `bun run check`。Expected: 成功。
- [ ] **Step 3:** Commit（メッセージ例: `feat: add markdown h2 TOC helper for case study detail`）。

---

### Task 4: `PortfolioLayout` と詳細ヘッダ型

**Files:** `src/components/portfolio/portfolio-types.ts`, `src/layouts/PortfolioLayout.astro`

- [ ] **Step 1:** `CaseStudyDetailHeaderProps` を追加する。

```typescript
export interface CaseStudyDetailHeaderProps {
  brand: string;
  caseStudyTitle: string;
  aboutHref: string;
  aboutLabel?: string;
}
```

- [ ] **Step 2:** `PortfolioLayout` の props に `caseStudyDetailHeader?: CaseStudyDetailHeaderProps` を追加する。`caseStudyDetailHeader` があればそれを表示し **`topNav` は使わない**。どちらも無い場合は従来どおり `topNav`。両方渡された場合は `caseStudyDetailHeader` を優先することをコメントで明記する。
- [ ] **Step 3:** Run `bun run check`。
- [ ] **Step 4:** Commit（メッセージ例: `feat(layout): support case study detail header in portfolio layout`）。

---

### Task 5: `CaseStudyDetailHeader.astro`

**Files:** Create `src/components/portfolio/CaseStudyDetailHeader.astro`, modify `PortfolioLayout` で import

- [ ] **Step 1:** Paper のヘッダ行（約50px高、1296px 幅コンテンツ）に寄せて実装する。左に `brand`、中央に `ケーススタディ / {caseStudyTitle}`、右に `About`（`aboutHref`）。クラス例は仕様コミット時点の `CaseStudyDetailHeader` ドラフトを参照する。
- [ ] **Step 2:** Run `bun run check`。
- [ ] **Step 3:** Commit（メッセージ例: `feat(portfolio): add Paper-style case study detail header`）。

---

### Task 6: 左目次・右関連・スクロールスパイ

**Files:** Create `CaseStudyDetailToc.astro`, `CaseStudyDetailRelated.astro`, `CaseStudyDetailTocScrollSpy.astro`

- [ ] **Step 1:** 左: `On this page`、リンクに `data-toc-anchor={slug}`、`href="#slug"`。`items.length === 0` は空表示でレイアウト崩れないようにする。
- [ ] **Step 2:** 右: `Other Case Studies`、他スラッグへのリンク、`preset` 番号表示。現在のエントリは除外。
- [ ] **Step 3:** `CaseStudyDetailTocScrollSpy.astro` で `IntersectionObserver` によりアクティブ見出しとリンクを同期（`PortfolioCaseStudyScrollSpy.astro` をベースにセレクタのみ変更）。
- [ ] **Step 4:** Run `bun run check`。
- [ ] **Step 5:** Commit（メッセージ例: `feat(portfolio): add case study TOC, related rail, and scroll spy`）。

---

### Task 7: `[slug].astro` の3カラム統合

**Files:** `src/pages/portfolio/work/[slug].astro`

- [ ] **Step 1:** `render(entry)` と `entry.body` から TOC を生成。`summaryRows` で表を描画。`PortfolioLayout` に `caseStudyDetailHeader` を渡し、`topNav` は削除する。
- [ ] **Step 2:** `lg:` で 240px / 720px / 296px 相当のグリッド。左右 `sticky`、固定ヘッダ分の `top` と `main` の `padding-top` を調整する。
- [ ] **Step 3:** ヒーロー画像の `transition:name` と `preset` 由来アスペクトは維持。Paper に合わせてフィルタ（grayscale 等）は調整する。
- [ ] **Step 4:** ビルド出力またはブラウザで `h2` の `id` が TOC の `href` と一致することを確認。不一致なら `tocFromMarkdownH2` と `rehype-slug` の規則を突き合わせて修正する。
- [ ] **Step 5:** Run `bun run check && bun run build`。
- [ ] **Step 6:** Commit（メッセージ例: `feat(portfolio): implement 3-column case study detail layout`）。

---

### Task 8: Paper レビューループ（必須）

- [ ] **Step 1:** MCP `user-paper` で `Case Study Detail (3-column)` を参照し、レイアウト・余白・タイポ・色・sticky を比較する。
- [ ] **Step 2:** 差分を修正し、再度確認する（最低1サイクル）。
- [ ] **Step 3:** Run `bun run check && bun run build`。
- [ ] **Step 4:** Commit（メッセージ例: `fix(portfolio): align case study detail with Paper reference`）。

---

## Plan self-review

| Spec セクション | 対応タスク |
|-----------------|------------|
| Goals | Task 5–8 |
| Non-goals（モバイル完全再現しない） | Task 7 |
| summaryRows・本文 | Task 2 + 7 |
| 目次・sticky | Task 1 + 3 + 6 + 7 |
| 右レール | Task 6 + 7 |
| Paper ループ | Task 8 |
| check / build | 各 Task |

Placeholder として TBD/TODO は置いていない。`summaryRows` は必須にし欠落をビルドで検出する。

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-13-case-study-detail-3-column-parity-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
