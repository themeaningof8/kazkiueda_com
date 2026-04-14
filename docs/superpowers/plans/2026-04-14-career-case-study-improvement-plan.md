# 転職向けケーススタディ改善 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 合意済み仕様（`docs/superpowers/specs/2026-04-14-career-case-study-improvement-design.md`）に基づき、ケーススタディを4本構成へ拡張し、既存3本を差分修正で強化する。加えて `/about` の接続文とケース詳細のOGPメタを整備し、採用担当向けの可読性と説得力を高める。

**Architecture:** Astro Content Collections を中心に、主変更は `src/content/case-studies/*.md`（本文・frontmatter）と `src/pages/case-study/[slug].astro`（ページ単位OGP設定）、`src/pages/about.astro`（人物像接続）で行う。レイアウトやデザインシステムの大幅変更は行わない。

**Tech Stack:** Astro 6, astro:content (`zod` schema), Astro page head metadata, Bun (`bun run check`, `bun run build`).

**Spec reference:** `docs/superpowers/specs/2026-04-14-career-case-study-improvement-design.md`

---

## File map

| Path | 変更内容 |
|---|---|
| `src/content/case-studies/design-system.md` | 差分編集（日本語見出し統一、定量レンジ追記、学びの接続明確化） |
| `src/content/case-studies/owners-app-proposal.md` | 差分編集（見出し日本語化、定量レンジ補強、刺さった理由の具体化） |
| `src/content/case-studies/scrum-master-decision-design.md` | 差分編集（見出し日本語化、未解決→学び→次アクション接続） |
| `src/content/case-studies/ai-page-production-initiative.md` | **新規追加**（Case 02: AI活用ページ制作知見） |
| `src/assets/case-studies/ai-page-production-initiative/hero.png` | **新規追加**（暫定ヒーロー画像） |
| `src/pages/about.astro` | 冒頭文をケース群と同一軸へ調整 |
| `src/pages/case-study/[slug].astro` | ケース詳細ページの `title/description/og:*` 出し分け対応 |
| `src/content.config.ts` | 必要時のみschema拡張（OG追加項目をfrontmatterで管理する場合） |

---

## Task 1: ケース順序とfrontmatter整備

**Files:**

- Modify: `src/content/case-studies/owners-app-proposal.md`
- Modify: `src/content/case-studies/scrum-master-decision-design.md`
- Create: `src/content/case-studies/ai-page-production-initiative.md`

- [ ] **Step 1: `order` を4本構成に更新する**
  - `design-system.md`: `order: 1`（維持）
  - `ai-page-production-initiative.md`: `order: 2`（新規）
  - `owners-app-proposal.md`: `order: 3`
  - `scrum-master-decision-design.md`: `order: 4`

- [ ] **Step 2: 新規Case 02のfrontmatterを既存schemaに合わせて作成する**
  - 必須項目: `title`, `description`, `tags`, `order`, `preset`, `heroImage`, `heroAlt`, `roleBadge`, `outcomeLabel`, `outcomeTitle`, `summaryRows`
  - `tags` に AI文脈を明示し、既存ケースとトーンを統一

- [ ] **Step 3: コミット**

```bash
git add src/content/case-studies/owners-app-proposal.md \
  src/content/case-studies/scrum-master-decision-design.md \
  src/content/case-studies/ai-page-production-initiative.md
git commit -m "feat(content): add ai case study and reorder portfolio cases"
```

---

## Task 2: 既存3ケースを差分修正（全面改稿しない）

**Files:**

- Modify: `src/content/case-studies/design-system.md`
- Modify: `src/content/case-studies/owners-app-proposal.md`
- Modify: `src/content/case-studies/scrum-master-decision-design.md`

- [ ] **Step 1: 見出しを日本語主軸へ統一する**
  - `Context` → `背景`
  - `Problem Framing` → `課題の再定義`
  - `My Role & Approach` → `役割とアプローチ`
  - `Outcome` → `成果`
  - `Challenges & Learning` / `What Didn't Work` / `Learning` → `課題と学び`

- [ ] **Step 2: 各ケースに定量レンジ（2〜3項目）を追記する**
  - 実数が難しい箇所は「体感」「約」「導入前比」を明記
  - 過剰断定（正確値の断言）は避ける

- [ ] **Step 3: 失敗・未解決を学びへ接続する記述を補強する**
  - 特にCase 04の終わり方を「弱い終わり」でなく「成熟した示唆」に調整

- [ ] **Step 4: コミット**

```bash
git add src/content/case-studies/design-system.md \
  src/content/case-studies/owners-app-proposal.md \
  src/content/case-studies/scrum-master-decision-design.md
git commit -m "refactor(content): strengthen outcomes and quantified impact in case studies"
```

---

## Task 3: Case 02（AI活用）の本文実装

**Files:**

- Create: `src/content/case-studies/ai-page-production-initiative.md`
- Create: `src/assets/case-studies/ai-page-production-initiative/hero.png`

- [ ] **Step 1: 日本語見出し構成で本文を実装する**
  1. 背景
  2. 課題の再定義
  3. AI協業の設計
  4. 品質を守るためのガードレール
  5. 成果
  6. 社内への展開（AIイニシアチブ）
  7. 学びと今後

- [ ] **Step 2: AI活用の境界を具体化する**
  - AIに任せた作業（草案、観点洗い出し等）
  - 人間が責任を持った作業（最終編集、品質判断、公開責任）

- [ ] **Step 3: 暫定ヒーロー画像を追加する**
  - 既存抽象画像を流用して `image()` 解決を先に満たす
  - 守秘とトーンに合う画像に後差し替え可能な構成とする

- [ ] **Step 4: コミット**

```bash
git add src/content/case-studies/ai-page-production-initiative.md \
  src/assets/case-studies/ai-page-production-initiative/hero.png
git commit -m "feat(content): add ai page production case study narrative"
```

---

## Task 4: About接続とOGPメタ整備

**Files:**

- Modify: `src/pages/about.astro`
- Modify: `src/pages/case-study/[slug].astro`
- Modify (optional): `src/layouts/PortfolioLayout.astro`

- [ ] **Step 1: `/about` 冒頭文を軸へ合わせる**
  - 「実装で前進させ、意思決定で停滞をほどく」人物像を反映
  - ケース本文と語彙トーンを揃える

- [ ] **Step 2: ケース詳細にページ単位OGPを追加する**
  - `title`: ケース名 + サイト名
  - `description`: ケースdescription
  - `og:title`, `og:description`, `og:type`, `og:url` を追加
  - `og:image` は既存ヒーロー利用または暫定方針を明示

- [ ] **Step 3: noindex方針を維持したままmeta追加が競合しないことを確認**

- [ ] **Step 4: コミット**

```bash
git add src/pages/about.astro src/pages/case-study/[slug].astro src/layouts/PortfolioLayout.astro
git commit -m "feat(seo): add per-case og metadata and align about narrative"
```

---

## Task 5: 検証

- [ ] **Step 1: 型・コンテンツ整合**

```bash
bun run check
```

期待: `astro check` 成功。frontmatter不足や型エラーなし。

- [ ] **Step 2: ビルド**

```bash
bun run build
```

期待: 静的ビルド成功。`/portfolio`, `/case-study/<slug>`, `/about` が生成される。

- [ ] **Step 3: 目視確認（dev/preview）**
  - `/portfolio`: 01〜04の順序と導線
  - `/case-study/ai-page-production-initiative`: 新規ケース表示
  - 既存3ケース: 見出し日本語化・定量追記が崩れていない
  - SNSデバッガ相当でメタタグ出力確認（HTMLソースで可）

- [ ] **Step 4: 最終コミット（必要時）**

```bash
git add -A
git commit -m "chore(content): polish case study copy and metadata after verification"
```

---

## リスクと対策

- **リスク:** 定量レンジが断定的に見える  
  **対策:** 比較基準（導入前比、体感）を必ず併記。

- **リスク:** Case 01 と Case 02 の実装テーマ重複  
  **対策:** 恒常基盤（Case 01）とAI協業運用（Case 02）の役割を明記。

- **リスク:** OGPメタ追加時にレイアウト責務が不明瞭  
  **対策:** まず `[slug].astro` に閉じて実装し、必要ならLayout拡張を最小化。

---

## 完了定義（DoD）

- 4ケース構成が `/portfolio` に反映される
- 既存3ケースは差分修正で強化され、全面改稿になっていない
- 見出しが日本語主軸で統一される
- 各ケースに定量レンジが2〜3項目含まれる
- Case 04は未解決→学び→次アクションで締まる
- `/about` 冒頭がケース群と同軸になる
- ケース詳細でOGPメタがページ単位出し分けされる
- `bun run check` と `bun run build` が成功する
