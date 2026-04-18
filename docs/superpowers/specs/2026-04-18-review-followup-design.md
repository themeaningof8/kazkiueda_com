# コードレビュー追従 — 設計（2026-04-18）

## 1. 目的

2026-04 のコードレビューで挙がったうち、**自動テスト追加以外**の項目を実装可能な形で仕様化する。

## 2. スコープ

### 2.1 含める

| 領域 | 内容 |
|------|------|
| TOC と slug | 本文の `rehype-slug` が付与する `id` と整合するよう、見出しから TOC を組み立てる処理を **Markdown AST ベース**に変更する |
| デッドコード | 未使用の `PortfolioTopNav` 経路、Starwind Popover 一式、関連ユーティリティ・型を削除し、レイアウト・設定を整理する |
| 関連ケース一覧 | `[slug].astro` の `relatedItems` 生成を **O(n)** にする（`findIndex` のネストをやめる） |

### 2.2 含めない

- **ユニットテスト / E2E の新規追加**（明示的にスコープ外）
- **IntersectionObserver の初期アクティブ表示**の UX 変更（別判断）
- **ドキュメントの歴史的 plan/spec の全面改訂**（必要なら参照メモのみ）

## 3. TOC（`case-study-toc`）

### 3.1 問題

現状 `tocFromMarkdownHeadings` は **ソース行の正規表現**で `##` 行を取り、行末文字列をそのまま `github-slugger` に渡す。本文レンダリングでは `rehype-slug` が **レンダリング後の見出しテキスト**から `id` を付けるため、**インライン記法入り見出し**で TOC の `href` と実 `id` がずれる可能性がある。

### 3.2 方針

- `entry.body`（Markdown 文字列）を **remark 系でパース**し、`heading` ノード（depth 2–6）のみを走査する。
- 各見出しの表示テキストは **mdast からプレーンテキスト化**（例: `mdast-util-to-string` 相当）し、その文字列を **`GithubSlugger`（インスタンスは文書ごとに 1 つ）**で slug 化する。これにより `rehype-slug` が一般的に使う「見出しのテキスト内容」と揃えやすい。
- 階層は現状どおり: **h2 をルート**、レベルが浅くなるまでスタックを pop し、h3 以降は親の子として接続する。

### 3.3 依存関係

- 実装時に **既存の Astro / lockfile に含まれる remark 系**で足りるか確認する。
- 不足する場合は **最小限の直接依存**を追加する（具体パッケージ名は実装プランで確定）。

### 3.4 検証（テストなし）

- `bun run check` / `bun run build` が通ること
- 既存ケーススタディ詳細で、左目次リンクが該当見出しに飛ぶこと、スクロールスパイ（`CaseStudyDetailTocScrollSpy`）が破綻していないこと（手動）

## 4. デッドコード削除

### 4.1 背景

どのページも `PortfolioLayout` に **`topNav` を渡していない**。したがって `PortfolioTopNav` → `PortfolioWorkNavPopover` → `PortfolioCaseStudyScrollSpy` は **マウントされない**。

### 4.2 削除対象（予定）

- `src/components/portfolio/PortfolioTopNav.astro`
- `src/components/portfolio/PortfolioWorkNavPopover.astro`
- `src/components/portfolio/PortfolioCaseStudyScrollSpy.astro`（参照なしのため削除）
- `src/components/starwind/popover/` 配下（Popover 一式）
- `src/lib/utils/starwind/positioning.ts`（Popover のみが参照する場合）

**維持**: `ThemeToggleButton` および `starwind/button`（継続利用）。

### 4.3 レイアウト・型

- `PortfolioLayout.astro`: `topNav` prop、`PortfolioTopNav` の import と分岐を削除
- `portfolio-types.ts`: `PortfolioTopNavProps`、`CaseStudyNavItem` を削除

### 4.4 設定

- `knip.json`: popover 用エントリ等、削除に合わせて更新
- `starwind.config.json`: `popover` コンポーネント登録を削除またはツールの期待に合わせて更新

### 4.5 CSS / トークン

- `--color-popover` 等は **他コンポーネントが未参照なら**後続で整理可能。本変更では **必須の削除とはしない**（ビルド・見た目が通ればよい）。

## 5. `relatedItems` の最適化

- `sortedForNav` を 1 パスで走査し、`entry.id` → **0-based index** の `Map` を構築する。
- `relatedItems` の `map` 内では `Map.get` で番号を取得し、**内側の `findIndex` を廃止**する。

## 6. リスクと緩和

| リスク | 緩和 |
|--------|------|
| remark と Astro 既定 Markdown の方言差 | 既存コンテンツでビルド・目次を確認；必要ならプラグインを 1 つずつ足す |
| Starwind 設定から popover を外すと CLI が期待する形とずれる | `starwind.config.json` を公式スキーマに沿って修正 |
| slug と `rehype-slug` の edge case | 既存 4 本の `.md` で一致を確認；稀なケースは実装プランで「手動確認項目」に明記 |

## 7. 完了の定義

- 上記スコープがコードに反映されている
- `bun run check` と `bun run build` が成功する
- ケーススタディ詳細の目次・関連リンクが意図どおり動作する（手動確認）

## 8. 次工程

本書のレビュー承認後、`writing-plans` スキルに従い **実装プラン**（タスク分解・ファイル単位）を作成する。
