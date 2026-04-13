# Design system case study (portfolio) — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved design-system narrative as a new `caseStudies` entry at **`order: 1`**, bump existing studies to **`2`–`5`**, add a local hero image, and verify listing and detail routes—without schema or layout component changes.

**Architecture:** Content-only change: one new Markdown entry under `src/content/case-studies/design-system.md` plus `src/assets/case-studies/design-system/hero.png`. Ordering is controlled exclusively by frontmatter `order` consumed by `getCollection` in `src/pages/portfolio/index.astro` and nav builders. Detail rendering remains `src/pages/portfolio/work/[slug].astro` + `astro:content` `render(entry)`.

**Tech Stack:** Astro 6 Content Collections (`astro:content`, `glob` loader, `image()` in `src/content.config.ts`), `astro:assets`, Bun scripts (`bun run check`, `bun run build`).

**Spec reference:** `docs/superpowers/specs/2026-04-13-design-system-case-study-design.md`

**Verification note:** No Vitest/Playwright in repo; use **`bun run check`** and **`bun run build`** as gates. Browser spot-check `/portfolio` and `/portfolio/work/design-system`.

---

## File map

| Path | 変更 |
|------|------|
| `src/content/case-studies/design-system.md` | **新規** — frontmatter + 本文（匿名・守秘注記・表・見出し構造） |
| `src/assets/case-studies/design-system/hero.png` | **新規** — 暫定は既存抽象ヒーローをコピー（後差し替え可） |
| `src/content/case-studies/ether-store.md` | `order: 1` → `2` |
| `src/content/case-studies/nexus-data.md` | `order: 2` → `3` |
| `src/content/case-studies/linear-studio.md` | `order: 3` → `4` |
| `src/content/case-studies/vera-finance.md` | `order: 4` → `5` |

触らない: `src/content.config.ts`、`src/pages/portfolio/work/[slug].astro`、`PortfolioCaseStudy.astro` などレイアウト系。

---

### Task 1: 既存ケースの `order` を 2〜5 に繰り下げ

**Files:**

- Modify: `src/content/case-studies/ether-store.md`（`order:` のみ）
- Modify: `src/content/case-studies/nexus-data.md`
- Modify: `src/content/case-studies/linear-studio.md`
- Modify: `src/content/case-studies/vera-finance.md`

- [ ] **Step 1: 各ファイルの `order` を書き換える**

`ether-store.md`:

```yaml
order: 2
```

`nexus-data.md`:

```yaml
order: 3
```

`linear-studio.md`:

```yaml
order: 4
```

`vera-finance.md`:

```yaml
order: 5
```

- [ ] **Step 2: コミット**

```bash
cd /Users/kazkiueda/Sources/github.com/themeaningof8/kazkiueda_com
git add src/content/case-studies/ether-store.md \
  src/content/case-studies/nexus-data.md \
  src/content/case-studies/linear-studio.md \
  src/content/case-studies/vera-finance.md
git commit -m "chore(content): bump case study order for new lead entry"
```

---

### Task 2: ヒーロー画像ディレクトリとプレースホルダ PNG

**Files:**

- Create: `src/assets/case-studies/design-system/hero.png`（バイナリ — コピーで生成）

- [ ] **Step 1: ディレクトリ作成とコピー**

既存の抽象ヒーロー（`ether-store`）を複製し、ビルドが通るローカル `image()` 参照を先に満たす。後から差し替えてよい。

```bash
cd /Users/kazkiueda/Sources/github.com/themeaningof8/kazkiueda_com
mkdir -p src/assets/case-studies/design-system
cp src/assets/case-studies/ether-store/hero.png src/assets/case-studies/design-system/hero.png
```

- [ ] **Step 2: コミット**

```bash
git add src/assets/case-studies/design-system/hero.png
git commit -m "feat(assets): add design-system case study hero placeholder"
```

---

### Task 3: `design-system.md` 新規（frontmatter + 本文全文）

**Files:**

- Create: `src/content/case-studies/design-system.md`

- [ ] **Step 1: 次のファイルをそのまま保存する**

（ページの `h1` は frontmatter の `title` のみ。本文は `##` から開始。社名・サービス名は出さない。技術製品名は可。）

```markdown
---
title: "デザインシステム構築——チームの自律性を生む共通言語の設計"
description: "ルールの属人化と実装のリードタイムを、リント・トークン・UIライブラリの三層と、デザインと実装の共通言語としてのデザインシステムでほどいた。保険・金融の二領域での基盤づくりをリードした。"
tags:
  - "デザインシステム"
  - "デザイントークン"
  - "フロントエンド"
  - "アクセシビリティ"
order: 1
preset: "01"
heroImage: "../../assets/case-studies/design-system/hero.png"
heroAlt: "幾何学パターンとニュートラルトーンの抽象的な平面（プレースホルダ。実画面・成果物ではない）"
roleBadge: "リードデザイナー / FE"
outcomeLabel: "OUTCOME"
outcomeTitle: "属人化した判断が共有財産になり、実装の細部ではなく体験と仕様の議論に集中できるチームへ。"
---

> 守秘義務により画面・成果物の掲載は非公開です。

| 項目 | 内容 |
| --- | --- |
| 役割 | リードデザイナー／フロントエンド実装／ステークホルダー調整 |
| 期間 | 約1年（保険・金融2事業） |
| 技術スタック | shadcn/ui・Radix Colors・TailwindCSS・Style Dictionary・Figma Variables |

## 何が問題だったか

### デザインのルールレス問題

担当デザイナーそれぞれが、頭の中にあるルールでレビューをしていた。明文化されていないから、指摘の根拠が人によって変わる。複数のデザイナーが関わると、意匠の好みで衝突が起きる。でもその衝突の本質は好みの問題ではなく、判断の拠り所がないことだった。

### 実装のリードタイム問題

コードベースには複数の CSS が混在していて、何かを修正しようとすると影響範囲の調査から始めなければならなかった。デザインデータはスクラッチで作られ、フロントエンドも毎回ゼロから実装する。車輪の再発明が当たり前になっていた。デザイナー側の意思決定の遅さも加わって、リードタイムを圧迫していた。

### 保守の問題

リポジトリの中にどんなコンポーネントがあって、それぞれ何が違うのか、把握している人間がいなかった。品質にばらつきのある実装が積み重なり、触るたびに速度が落ちる。誰も全体像を知らないまま、コードが増え続けていた。

## どう動いたか

### ドキュメント運用に頼らない「秩序」の目標

解決策として UI ライブラリの構築を提案したが、それだけでは不十分だと思っていた。「ドキュメントを整備してルールを守ってもらう」という方法は、忙しくなってくると読み飛ばす人が出てくる。形骸化する。ドキュメントを守っているかチェックする役割が必要になり、そのチェックがボトルネックになって施策のリードタイムが頭打ちになる。人が読んで守るという前提に立つ運用は、チームが大きくなるほど崩れやすい。

目指したのは「ドキュメントで規約を管理しなくても、自然と秩序が保たれる状態」だった。

### 実装の三層：リント、Tailwind、UIライブラリ

そのために手を入れたのは3つの層だ。

ESLint や Biome によるリントルールで、コードの書き方そのものに制約を持たせた。ルール違反はツールが検出するので、レビューで人が指摘する必要がない。TailwindCSS のユーティリティクラスで、スタイルの選択肢を構造的に絞った。「何を使っていいか」を都度調べなくても、使えるものが自然に限定される。その上に UI ライブラリを置くことで、コンポーネントの再利用が当たり前になる状態を作った。

### デザインプロセスとトークンパイプライン

デザインプロセス側にも同じ考え方を持ち込んだ。Figma Variables を Single Source of Truth として、`tokens.json` 経由で TailwindCSS に自動変換するパイプラインを Style Dictionary で実装した。Figma と TailwindCSS で同じトークンが使われる状態を担保することで、デザイナーとエンジニアの間の「翻訳コスト」をなくしたかった。

### アクセシビリティを土台に組み込む

アクセシビリティへの対応は、デザイナーとして以前から気になっていた。ただ現実として、きちんと対応しようとすると工数がかかる。売上を直接積み上げるような施策でもないから、優先度が上がりにくい。後回しにされ続けるのが実態だった。UI ライブラリを構築するなら、コンポーネントの段階で a11y 対応をある程度組み込めると思った。個々の施策で毎回対応するのではなく、土台に埋め込んでしまえば、意識しなくても一定の水準が保たれる。劇的な改善ではないけれど、今の状況より確実に一歩前に進める。それで十分だと判断した。

### 金融事業での先行と共有リポジトリの限界

実は保険事業のデザインシステムを作る前に、金融事業で先行して取り組んでいた。課題感の整理とアプローチの方向性まで自分が主導し、実際の構築はチームメンバーに担ってもらった。

金融のデザインシステムは、UI ライブラリを独立したリポジトリとして作り、各サービスからインポートする形をとった。構造としては教科書通りだったが、運用に入ってから問題が出てきた。UI ライブラリの保守自体が新しいタスクとして事業に生まれてしまった。複数サービスで仕様が微妙に違う場合の差異をどう処理するかという判断も、都度必要になった。

さらに、事業の中で非注力サービスはどうしても生まれる。そのサービスのアップデートが滞ると、UI ライブラリ本体のアップデートに支障をきたすケースが起きた。非注力サービスのメンテを入れることで対処はできたが、本来事業として好ましい動きではない。共通リポジトリで管理するモデルは、全プロジェクトが均等に保守される前提に立っている。その前提が崩れると、全体が止まる構造的な脆弱性があった。

### 保険事業での方針転換（ソースコピーと shadcn/ui）

この経験を踏まえて、保険事業では設計の考え方を変えた。金融で起きた問題の根本は、UI ライブラリをリポジトリとして共有していたことにある。依存関係が生まれると、どこか一つが止まったとき全体に波及する。だから保険ではインポートではなく、ソースコードのコピーで対応する方式にした。各プロジェクトがコンポーネントを自分のリポジトリに持つ。バージョン管理の依存がなくなるので、非注力サービスの状態が他のプロジェクトに影響しない。UI ライブラリとして shadcn/ui を採用したのも、この設計思想と一致していたからだ。コンポーネントをコピー&ペーストして使うという shadcn/ui のアプローチは、最初から「依存を持たない」ことを前提にしている。

### カラー設計（Radix Colors）

カラー設計にも同じ考え方を持ち込んだ。採用したのは Radix Colors の12段階のカラースケールだ。各ステップに意味が定義されているので、「この色をどこに使うか」という判断に拠り所ができる。デザイナーのルールレス問題は、色の領域でも起きていた。Radix Colors を土台にすることで、何にどの色をつけるかが明確になり、レビュー時の「なぜこの色なのか」という議論も減った。

## 何が変わったか・何を学んだか

デザイナー間の「意匠の好み」に関する議論がなくなった。リポジトリに亜種コンポーネントが増殖する問題も解消された。エンジニアとの会話の質が変わり、実装の細かい話ではなく体験や仕様の議論に集中できるようになった。

一番大きかった変化は、メンバーが自律的にコンポーネントを使い始めたことだ。属人化していた判断が、チームの共有財産になっていった。

この仕事を通じて思ったのは、デザインシステムは UI の問題ではなく、組織のコミュニケーション設計だということだ。ツールより先に「なぜ共通化するのか」をチームで共有することが定着の鍵で、設計の持続可能性は技術的な正しさより「誰が保守するか」という組織の構造に依存する。どの組織にも通用する答えはない。だから毎回、その組織を診断するところから始める。それが自分のやり方だ。
```

- [ ] **Step 2: 型とビルド**

```bash
cd /Users/kazkiueda/Sources/github.com/themeaningof8/kazkiueda_com
bun run check
```

期待: エラーなし（`design-system` コレクションエントリがスキーマに適合）。

```bash
bun run build
```

期待: 静的生成成功。`dist` に `/portfolio/work/design-system/index.html` が含まれる（Astro の URL 構造に依存 — 存在確認は `find dist -name '*design-system*'` などでよい）。

- [ ] **Step 3: コミット**

```bash
git add src/content/case-studies/design-system.md
git commit -m "feat(content): add design-system case study as lead entry"
```

---

### Task 4: 手動スポットチェック（任意だが推奨）

**Files:** なし（ブラウザ）

- [ ] **Step 1: 開発サーバーで確認**

```bash
bun run dev
```

ブラウザで `http://localhost:4321/portfolio` を開き、**先頭カード**が「デザインシステム構築——…」になっていること、タグ・OUTCOME・画像が表示されることを確認する。

- [ ] **Step 2: 詳細ページ**

`http://localhost:4321/portfolio/work/design-system` を開き、守秘の引用、表、各 `##` / `###`、プローズのスタイルが崩れていないことを確認する。

---

## Self-review（プラン vs スペック）

| スペック要件 | タスク |
|--------------|--------|
| `order: 1` と既存 2〜5 | Task 1 |
| 匿名（社名なし）・守秘・技術名可 | Task 3 本文 |
| スラッグ `design-system` | ファイル名で満たす |
| ヒーロー assets | Task 2 |
| `preset: 01` | Task 3 frontmatter |
| roleBadge 短縮 + 表でフル | Task 3 |
| 検証 `check` / `build` | Task 3 Step 2 |
| スキーマ非変更 | ファイルマップどおり触らない |

プレースホルダ文言のスキャン: 「後で差し替え」は Task 2 に**明示手順**（`cp`）付きで記載済み。TBD なし。

---

## Execution handoff

**Plan complete and saved to** `docs/superpowers/plans/2026-04-13-design-system-case-study-plan.md`. **Two execution options:**

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
