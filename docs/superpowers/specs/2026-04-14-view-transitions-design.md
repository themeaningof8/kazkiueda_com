# View Transitions（ポートフォリオ）設計

**Date:** 2026-04-14  
**Status:** Approved for implementation planning  
**Scope:** Astro `ClientRouter` によるクライアント遷移における View Transitions API の扱い。CSS の `transition`（Tailwind `@utility` 等）の詳細は別軸とする。

---

## 1. 背景と目的

採用担当が短時間で読むポートフォリオ（`CLAUDE.md` の Design Context）において、一覧からケーススタディ詳細への移動は **静かで信頼感のある連続性** が望ましい。View Transitions はそのための手段の一つであり、主役は常に本文と情報構造である。

---

## 2. スコープと非スコープ

### 2.1 スコープ（本設計で扱う）

- `PortfolioLayout` の `<ClientRouter />`（`astro:transitions`）による **同一オリジン内のクライアント遷移**における View Transitions。
- **ルート** `::view-transition-old(root)` / `::view-transition-new(root)`（および必要に応じて `::view-transition-group(root)`）の見え方：時間、イージング、`prefers-reduced-motion`。
- **共有要素** `transition:name`（値 `case-hero-<id>`）：一覧のカード画像と詳細ヒーロー画像の対応関係の維持（意味の共有を優先）。
- **`prefers-reduced-motion: reduce`** 時の View Transition アニメーションの抑制方針の明文化。

### 2.2 非スコープ（本設計では扱わない）

- 目次・関連カード等の **CSS `transition` / `@utility`** の詳細（別途コンポーネント／トークンで管理）。
- `document.startViewTransition` を任意インタラクションに広げる一般方針（必要なら別ブレスト）。
- MPA 全体の View Transitions や、静的ホスティング前提を外すアーキテクチャ変更。

---

## 3. アーキテクチャ方針（疑似要素の責務）

### 3.1 ルート（`root`）

- **役割:** ページ全体の入れ替わりのベース。短いクロスフェードにより、文脈が急に断切れしないようにする。
- **実装の置き場:** `src/styles/styles.css` に `::view-transition-old(root)` / `::view-transition-new(root)` を集約する。コンポーネント内 `<style>` で二重定義しない。
- **調整:** 現行の約 280ms 前後を起点とし、ヒーローとのバランスを取る場合は **ルートのみやや短くする**等の変更は許容する（実装計画で数値を確定する）。

### 3.2 名前付き（`case-hero-<id>`）

- **役割:** 同一コレクションエントリの画像が「同じビジュアル資産の連続」として読めること。
- **制約:** `transition:name` はエントリ id ごとに変わるため、**slug ごとに `::view-transition-group(case-hero-*)` を大量に CSS 定義する方式は採用しない**（保守コストとセレクタ爆発を避ける）。
- **方針:** ヒーローは **ブラウザ既定の共有要素挙動に近い見え方を尊重**し、CSS での細かい per-name チューンは最小限に留める。主な演出のノブは **ルート** に置く。

### 3.3 `prefers-reduced-motion: reduce`

- `styles.css` 内の `@media (prefers-reduced-motion: reduce)` で、**View Transition 用の `::view-transition-*` アニメーションを無効化**する（現行方針を維持）。
- 同メディアクエリ内の **`* , *::before, *::after { transition-duration: 0.01ms !important; ... }`** は、通常 UI の `transition` と View Transitions の両方に影響する。**意図的なグローバル短縮**であり、View Transitions 設計の前提条件として文書化する。変更する場合は UI トランジションとの両立を必ず検証する。

---

## 4. 採用したアプローチ（ブレストの結論）

| 案 | 概要 | 採用 |
|----|------|------|
| 1 最小構成 | ルートのみ明示、ヒーローはほぼ既定 | 部分的（ルート明示は維持） |
| 2 名前付き分離 | ルートとヒーローで CSS を完全分割 | **採用しない**（slug 可変 name のため重い） |
| 3 ドキュメント先行 | 挙動と境界を spec に固定 | **併用** |

**結合方針:** **ルートを設計の主戦場**とし、ヒーローは `transition:name` で意味の共有を保証する。**案 2 の全面適用は行わず**、本書で振る舞いと境界を固定する（案 3）。

---

## 5. 成功条件

1. 一覧 → 詳細の遷移で、**文脈が急に断切れない**（ルートの短いフェード）。
2. 対応ブラウザでは、ヒーローが **同一案件の連続**として認識できる。
3. `prefers-reduced-motion: reduce` では、View Transition 由来の動きが **実質オフ**。
4. View Transitions 非対応環境では **即時表示にフォールバック**しても破綻しない。

---

## 6. 検証（手動）

- Chrome / Safari / Firefox：一覧 → 詳細 → 別事例（または戻る）を数往復。
- OS の視覚効果／動きの軽減をオン：ルート VT が抑制されること。
- ヒーロー `preset` 違いで **致命的なちらつきや寸法崩れ**がないこと。
- 必要に応じて DevTools で `::view-transition-*` の付与を確認。

---

## 7. 既存実装との対応表

| 要素 | 場所 | 備考 |
|------|------|------|
| `ClientRouter` | `src/layouts/PortfolioLayout.astro` | レイアウトに 1 回のみ |
| `transition:name` | 一覧カード画像・詳細 `Image`（例: `[slug].astro`） | `case-hero-<id>` 一致を維持 |
| ルート VT の時間・イージング | `src/styles/styles.css` `@media (prefers-reduced-motion: no-preference)` | 変更時は本書セクション 3・6 に従う |
| reduced-motion | 同上 `reduce` ブロック | グローバル `*` ルールとの関係を理解した上で編集 |

---

## 8. 次のステップ

実装に入る前に **`writing-plans` スキル**で実装計画（変更ファイル・検証手順）を起こす。本 spec の変更が入った場合は本書を更新してから計画を追随させる。
