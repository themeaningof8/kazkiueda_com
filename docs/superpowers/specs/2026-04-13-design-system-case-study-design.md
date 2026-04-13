# Design: デザインシステム案件のケーススタディ（先頭表示・匿名表記）

## 目的

ポートフォリオの**第1ケーススタディ**として、約1年のデザインシステム／UI基盤構築の仕事を `caseStudies` コレクションに追加する。守秘のため**事業名・社名は出さず**、**画面・成果物の実物は掲載しない**。本文はユーザー提供原稿を正とし、Markdown の見出し階層のみ整える。

## 非ゴール

- `content.config.ts` のスキーマ変更、またはケーススタディ用の新コンポーネント追加
- 実クライアント画面の掲載、または守秘と矛盾する固有名の記載
- 既存プレースホルダ案件（`ether-store` 等）の削除。並び順のみ繰り下げる

## 背景（コンテキスト）

- ケーススタディは `src/content/case-studies/*.md` と `src/content.config.ts` の `caseStudies` で定義される。
- 一覧の順序は frontmatter の **`order`（昇順）**。
- 詳細 URL は **`/portfolio/work/<id>`** で、`<id>` はローダーによるエントリ ID（本件ではファイル名 **`design-system`** を想定）。
- 詳細ページは frontmatter 由来のヘッダののち、本文を **`prose`** で表示する。

## 合意済み要件

| 項目 | 決定 |
|------|------|
| 一覧位置 | **`order: 1`**（先頭）。既存4件は **2〜5** に繰り下げ |
| 匿名表記 | **抽象ラベルのみ**（社名・サービス名は出さない） |
| 本文 | **ユーザー貼付原稿を正**（分量・主張は維持、`##` / `###` で構造化） |
| スラッグ | **`design-system`** → `/portfolio/work/design-system` |
| 実装方針 | **新規 `.md` + ヒーロー画像アセット**。スキーマ・詳細レイアウトコンポーネントは原則変更しない |

## frontmatter マッピング

| フィールド | 方針 |
|------------|------|
| `title` | 原稿のタイトル（長め可。ページ `h1` はこれのみ） |
| `description` | 一覧用に**1〜2文**に圧縮。リードデザイン／組織と実装の両面が伝わること |
| `tags` | **3〜5 件**。例: デザインシステム、デザイントークン、フロントエンド、アクセシビリティ（必要に応じ調整） |
| `order` | **`1`** |
| `preset` | **`01`**（横長ヒーロー。既存 ether と同系） |
| `heroImage` | `../../assets/case-studies/design-system/hero.png` |
| `heroAlt` | 実画面を連想させない**抽象**の説明。プレースホルダである旨の言及可 |
| `roleBadge` | カード幅を考慮し**短縮表記**（例: リードデザイナー / FE）。**本文先頭の表で役割のフル表記** |
| `outcomeLabel` | `OUTCOME` |
| `outcomeTitle` | 成果の核を**1行**（自律的利用、議論の質の変化など原稿の「何が変わったか」から抽出） |

## 本文構成（Markdown）

1. 任意: 守秘に関する**短い注記**（既存プレースホルダと同様、`>` でも可）
2. 原稿の**情報表**（役割・期間・技術スタック）を **Markdown 表**で再現
3. `## 何が問題だったか` — 3課題（ルールレス、リードタイム、保守）
4. `## どう動いたか` — 下位見出し例:
   - `###` ドキュメント運用への懐疑と「秩序が自然に保たれる」目標
   - `###` 実装層（リント、Tailwind、UI ライブラリ）
   - `###` デザインプロセス（Figma Variables → tokens.json → Style Dictionary → Tailwind）
   - `###` アクセシビリティを土台に埋め込む判断
   - `###` 金融での先行（共有リポジトリ）と課題
   - `###` 保険での方針転換（ソースコピー、shadcn/ui との整合）
   - `###` カラー（Radix Colors）
5. `## 何が変わったか・何を学んだか` — 成果と学び（デザインシステム＝コミュニケーション設計、保守と組織）

技術製品名（shadcn/ui、Radix Colors、TailwindCSS、Style Dictionary、Figma Variables 等）は本文に記載してよい。

## ファイル変更一覧

| 操作 | パス |
|------|------|
| 新規 | `src/content/case-studies/design-system.md` |
| 新規 | `src/assets/case-studies/design-system/hero.png`（抽象プレースホルダ。他案件ヒーローと同品質・トーンで用意） |
| 更新 | `src/content/case-studies/ether-store.md` — `order: 1` → **`2`** |
| 更新 | `src/content/case-studies/nexus-data.md` — `order: 2` → **`3`** |
| 更新 | `src/content/case-studies/linear-studio.md` — `order: 3` → **`4`** |
| 更新 | `src/content/case-studies/vera-finance.md` — `order: 4` → **`5`** |

## 検証

- プロジェクト標準のビルド（例: `pnpm astro build` または `npm run build`）が成功する
- `/portfolio` で当該ケースが**先頭**に表示される
- `/portfolio/work/design-system` で本文・表・見出しが意図どおり表示される

## 実装プランへの引き継ぎ

本スペックがレビュー承認されたら **`writing-plans`** スキルに従い、上記ファイル変更と本文取り込み手順をタスク分解した実装プランを別ドキュメントに起こす。

## セルフレビュー（プレースホルダ・矛盾チェック）

- 未定義の TBD なし。スコープは単一コレクションエントリと order 更新に限定。
- 「社名を出さない」と「技術スタック名を本文に書く」は矛盾しない（製品名は可、依頼主の固有名は不可）。
- 前提「貼付原稿を正」と frontmatter の短縮フィールド（`description`, `roleBadge`, `outcomeTitle`）は、原意を損なわない要約・抽出で両立する。
