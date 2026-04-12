# Portfolio — Stitch layout parity (Sage + Noto) — design spec

**Status:** Draft pending author review (2026-04-12).  
**Reference:** `docs/stitch-ref/portfolio-home-updated/screen.html`（Stitch 画面「Portfolio Home (Updated Content)」エクスポート。配色・Inter は参照せず、**レイアウト・コンポーネント形状・余白・情報階層**のみ正とする）。  
**Supersedes (partial):** `docs/superpowers/specs/2026-04-12-portfolio-persistent-case-study-nav-design.md` のうち、**レイアウト／ナビ配置**に関する記述。機能要件（アンカー、詳細遷移、コレクション）と整合する範囲で置き換える。

## 1. Goals

- **`/portfolio` の見た目の骨格**を、参照 HTML の **トップバー → ヒーロー → Selected Works（非対称 12 列）→ About → Contact CTA → フッター** の順と **各ブロックの余白・階層**に寄せる。
- **カラー:** 既存の **`portfolio.css` / Tailwind の Sage トークンのみ**（`surface-*`, `fg-*`, `accent`, `border-*` 等）。Stitch の `primary` / `surface-container-*` 等の **16 進値や名前は採用しない**。
- **フォント:** **`Noto Sans JP Variable`（`font-sans`）のみ**。Inter 等は **追加しない**。
- **維持する機能（必須）:** Astro Content Collections、**`/portfolio/work/[slug]`**、一覧↔詳細の **View Transitions**、**ケーススタディ用ナビ**（デスクトップ **レール** + モバイル **チップ**）、**アンカー移動**、**`IntersectionObserver` によるアクティブ表示**、スキップリンク、`lang="ja"`。
- **モバイル用チップ:** **`position: fixed` + `bottom: 0`** の **全幅横一列帯**（Stitch フッター行の **横並び・低密度**のリズムに寄せる）。本文は **チップ高さ + セーフエリア相当の下パディング**で **常に隠れない**。
- **各ケーススタディ:** **1 案件 = 1 つの横方向ブロック**（Stitch の `asymmetric-grid` 各行）。**md 以上**は画像列とテキスト列を **同一行**に配置し、**奇偶で左右反転**。狭い幅では縦積みに崩してよいが、**情報ブロックの順序ルール**は HTML に合わせて文書化する。

## 2. Non-goals

- Stitch の **カラートークンや Inter の導入**。
- 参照 HTML の **外部画像 URL を本番の唯一ソース**とすること（プレースホルダはコレクションの `heroImage` を正とする）。
- `curl` のみで Stitch 資産を取得する運用（MCP / 手動エクスポートで取得済みファイルを正とする）。
- 公開 SEO / `noindex` 方針の変更。

## 3. Information architecture

### 3.1 固定トップバー（新規）

- **位置:** `PortfolioLayout` 内、`<main>` の外または `<main>` 先頭の前に配置し、**`fixed top-0` 全幅**。
- **内容:** 左にサイト名／肩書きテキスト、**`md` 以上**で中央に **`#work` / `#about` / `#contact`** へのアンカー、右に **CTA**（メール `mailto:` または `#contact` へのボタン — 実装プランで確定）。
- **スタイル:** Stitch の **細いシャドウ + 半透明背景**の **リズム**に寄せるが、色は **`surface-canvas` / `border-subtle` / `fg-strong` / `accent`** 等に **マッピング**。
- **モバイル:** 中央リンクは **`md` 未満では非表示**にしてよい（YAGNI）。ハンバーガーメニューは **必須としない**；必要になったら別イテレーション。

### 3.2 ヒーロー

- 参照 HTML と同様の **見出し 2 行構造（主行 + 副行）+ リード**の **階層・余白**に寄せる。
- 文言は **props または後続のコピー差し替え**で調整可能。初期文言は実装プランで決定。

### 3.3 Selected Works（`#work`）

- セクション見出し（「Selected Works」相当）+ **短いアクセント下線**（`accent` を用いた細い帯）。
- **レイアウト:** 左 **ナビ列（既存レール）** + 右 **メイン列** の二段構成とし、メイン列内で **12 列グリッド**を再現する（レールが Stitch 原文に無いため、**原文の 12 列はメイン列内に閉じる**）。
- **各行:** 背後の **大きな番号**（`01`–`04`）、**ロール用バッジ**、**見出し + 説明**、**OUTCOME ボックス**（左縦ラインアクセントは `border-l` + `accent`）、**詳細への CTA**（ラベルは Stitch に寄せ、**URL は `/portfolio/work/[slug]`**）。
- **画像:** 既存 `getImage` 結果を使用。ホバー時の **グレースケール解除・軽いスケール**は参照 HTML に合わせてよい（`prefers-reduced-motion` では弱める／無効化）。

### 3.4 モバイル用チップ（固定下端）

- **`fixed bottom-0 inset-x-0`**、**横スクロール**、**Sage トークン**で「フッター帯」に近い落ち着いた帯。
- **`z-index`:** フッターより上、**将来のモーダルより下**の固定ルール（具体値は実装プラン）。
- **`main`（または `#main-content` 直下ラッパー）** に **`padding-bottom`** を持たせ、**チップ高 + iOS セーフエリア**をカバーする。
- **キーボード:** フォーカスリングは **チップ内リンク**に維持。`aria-current` は **現行ロジック**を踏襲。

### 3.5 About / Contact / Footer

- **About:** 参照 HTML の **2 カラム**（画像 + テキスト + スキルタグ列）の **配置と余白**に寄せる。既存 `PortfolioAbout` を拡張するか、マークアップを差し替えるかは実装プランで **変更最小**を優先。
- **Contact:** 参照の **全面アクセント帯**（こちらでは **`bg-accent` + `text-fg-on-accent`** 等で Sage にマッピング）+ 中央揃え CTA。
- **Footer:** **横一列**（左: コピーライト、右: リンク列）の **リズム**に寄せる。既存 `PortfolioFooter` を流用可能なら流用。

## 4. Content model（frontmatter 拡張案）

以下を **Zod + Markdown frontmatter** に追加する（名前は実装で確定、例示）:

| フィールド | 型 | 用途 |
|-----------|-----|------|
| `roleBadge` | `string` | 案件上の小バッジ（参照 HTML の "Lead Designer" 相当） |
| `outcomeLabel` | `string` | OUTCOME 見出し（固定文字列でも可） |
| `outcomeTitle` | `string` | OUTCOME 本文の太字行 |

既存の `title`, `description`, `tags`, `preset`, `heroImage`, `order` は維持。**`preset`** は引き続き **画像アスペクト比**等に使用可能。番号表示は **`order` または固定 01–04 表示ルール**を実装プランで決める（コレクション件数と矛盾しないこと）。

## 5. Behavior and accessibility

- **アンカー + `IntersectionObserver`:** チップとレールの **両方**で `aria-current` を同期。チップが下端固定になっても **監視対象セクション id は不変**（`case-{slug}`）。
- **`scroll-margin` / `scroll-padding`:** 固定トップバー + 下端チップの **両方**を考慮し、見出しジャンプ時に **隠れにくく**する。
- **`prefers-reduced-motion: reduce`:** 既存方針に従い、**過剰なトランジションを抑制**。

## 6. Testing

- `bun run check` / `bun run build` が通ること。
- **手動:** 固定トップ + **固定下チップ** + 長いスクロールで **本文末尾が隠れない**こと、**チップがフッターより手前で破綻しない**こと、**ナビクリックで正しいセクション**へ飛ぶこと、**詳細ページ遷移 + View Transition** が維持されていること。

## 7. Self-review checklist

- **プレースホルダ:** 未確定は「実装プランで確定」と明記した箇所のみ（CTA の具体、ハンバー要否、Zod フィールド名）。
- **一貫性:** 色・フォントは B 遵守。レイアウトは参照 HTML 優先。
- **スコープ:** `/portfolio` 一覧と共有レイアウト部品に限定。詳細ページの全面差し替えは含めない（既存詳細 spec と両立）。
- **旧 spec との関係:** ナビ位置（上端チップ）から **下端固定**へ変更 — 本書が優先。
