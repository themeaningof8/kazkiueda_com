# Case Study Detail (3-column) parity — design spec

**Status:** Approved in brainstorming (2026-04-13).  
**Scope:** `/portfolio/work/[slug]` の全ケーススタディ詳細ページを、Paperの `Case Study Detail (3-column)` にPC幅でほぼ忠実再現する。本文文言は現状優先。

## 1. Goals

- 対象は **全詳細ページ**（`/portfolio/work/[slug]`）。
- PC表示で `Case Study Detail (3-column)` のレイアウト・余白・タイポ・情報密度を高精度に再現する。
- 左レール（目次）と右レール（関連事例）は **sticky** で追従させる。
- 本文コピーは既存Markdownデータを優先し、見た目と構造をPaper準拠にする。
- 上部ナビ（ヘッダ）もPaper詳細ページ文脈に合わせて寄せる。

## 2. Non-goals

- 本フェーズでのタブレット/モバイル完全再現。
- ケーススタディ本文の内容改稿（文言差し替え）。
- コンテンツソースの変更（引き続きContent Collections + Markdown）。

## 3. Chosen approach

本仕様は次の比較で **Approach A** を採用する。

- **A (chosen):** `src/pages/portfolio/work/[slug].astro` を中核に3カラム専用構造へ再構成し、既存データを流用
- B: 新規コンポーネントを大規模分割して厳密再現
- C: 既存DOMを極力維持したCSS中心の最小変更

採用理由:

- 忠実再現に必要なDOM構造制御を確保しつつ、過度なコンポーネント増殖を避けられる。
- 既存の `caseStudies` データ/並び順ロジックを活かせる。
- 今回のスコープ（PC忠実化）に対して最短で品質到達しやすい。

## 4. Page architecture

ページを次の3層で構成する。

1. **Header**（Paper準拠の詳細文脈ナビ）
2. **Tag Row**（frontmatter `tags`）
3. **Detail Columns**（3カラム本体）

3カラム本体は次を基準値とする。

- 左: `240px`
- 中: `720px`
- 右: `296px`
- 合計コンテンツ幅: `1296px`

中央カラムの縦構造は固定:

- Lead（description相当）
- Hero image
- Summary table
- Body sections（Markdown）

## 5. Component responsibilities

### 5.1 Header

- 左: 作者名/ブランド表示
- 中: `ケーススタディ / {title}`（必要に応じて2行まで折返し）
- 右: `About` 導線
- 目的は最小導線で文脈を明示すること。装飾は抑える。

### 5.2 Tag Row

- `tags` を表示
- 見た目（境界線・内側余白・文字密度）はPaper準拠
- 文字内容は既存データを利用

### 5.3 Left Nav Rail

- ラベル: `On this page`
- 中央本文セクション見出しから目次を生成
- アンカー移動 + 現在地ハイライト（`aria-current`）
- PCで sticky 追従

### 5.4 Main Content Rail

- Lead → Hero → Summary Table → Body
- Summary Tableは「ラベル列 + 値列」の2列反復
- 本文はMarkdown由来を維持し、タイポ/余白をPaper準拠化

### 5.5 Right Related Rail

- ラベル: `Other Case Studies`
- 現在ページ以外の事例を、`order` + `id` の既存規則で表示
- 各項目は番号（`preset`）+ タイトル + 詳細リンク
- PCで sticky 追従

## 6. Data flow and state

- データソースは既存の `getCollection('caseStudies')` を単一ソースとして維持
- 表示中ページ: `entry`
- 右レール一覧: `allCaseEntries` から `entry.id` を除外
- 目次: 本文見出し（`h2` を基本、必要なら `h3`）を対象に生成
- クライアント状態は最小化し、現在セクション同期のみを保持

## 7. Error handling and fallbacks

- 目次対象見出しが0件でもページ描画は継続（左レールは空状態）
- 関連事例が0件でも右レールは空状態表示で破綻させない
- 画像失敗時もアスペクト枠を維持してレイアウト崩れを防止
- sticky非対応/無効環境では通常フローで可読性を維持

## 8. Verification criteria

- `bun run check` と `bun run build` が通る
- 複数の `/portfolio/work/[slug]` で3カラム構造が成立
- 左右レールがsticky挙動する
- 目次クリック遷移とスクロール時ハイライトが機能する
- 右レールで他ケースへ遷移できる
- 上部ナビがPaper準拠の密度/配置に近づいている

## 9. Mandatory Paper review loop

実装完了後、必ず次を実施する。

1. Paperの `Case Study Detail (3-column)` を参照して差分確認
2. 差分を `layout / spacing / typography / sticky behavior` で整理
3. 修正を反映
4. 再確認して収束を確認

**最低1回の「確認→修正→再確認」ループを完了条件に含める。**

## 10. Out of implementation until plan phase

- この仕様書承認後は **writing-plans** に遷移して実装計画を作成する。
- 実装コード変更は、計画合意後に着手する。
