# Portfolio listing — persistent case study nav (Stitch-aligned) — design spec

**Status:** Draft pending author review (brainstorming closed 2026-04-12).  
**Reference:** Stitch project「Webデザイナー ポートフォリオ」screen「Portfolio with Persistent Case Study Nav」（レイアウト・情報の優先度の参照。色はサイトトークンのみ）。  
**Related:** `docs/superpowers/specs/2026-04-12-portfolio-case-study-detail-design.md`（詳細ページ `/portfolio/work/[slug]` は別スコープとして維持）。

## 1. Goals

- **`/portfolio` の一覧体験**を、Stitch 画面の構造（**常時見えるケーススタディ用ナビ**＋メイン列）に寄せる。
- **カラー・タイポのトーン**は既存の **`portfolio.css` / Tailwind トークン**（Sage 系）に統一し、Stitch の配色値は採用しない。
- **コピー方針（B）:** 表示テキスト（ヒーロー・ケースの見出し・リード・タグ文言など）は **Stitch エクスポートのダミーに寄せる**。エクスポート入手までは **明示的な仮文案**でレイアウトを固め、後から差し替える。コレクションの **`order`・`slug`・画像参照・`preset`** など構造は既存どおり活かす。
- **詳細ページへの導線**は既存仕様を壊さない（各ケースから **`/portfolio/work/[slug]`** へ進める）。

## 2. Non-goals

- Stitch のホスト URL を **認証なし `curl` だけで取得する**こと（初期 HTML に画面資産が含まれないため不可。参照用 HTML/画像は手動エクスポートまたは API/MCP 経由で別途取り込む）。
- 詳細ページ内に **同一の常時ナビを複製**すること（本イテレーションでは **`/portfolio` 一覧に限定**）。詳細にナビを足す場合は別 spec。
- 新しいカラーパレットやフォントファミリーの導入。
- `noindex` 方針の変更や公開 SEO。

## 3. Information architecture and layout

- **上部:** 既存と同様に **ヒーロー**（コピーは B に従い Stitch 寄せ／仮文案）。
- **ヒーロー直下〜フッター手前:** **2 カラム**（ブレークポイントは実装で決定、目安は `md` 以上）。
  - **ナビ列（狭）:** `order` ソート済みの **全ケーススタディ一覧**。スクロールに追従（`position: sticky` 等）。現在閲覧中に近いセクションを **視覚的にハイライト**。
  - **メイン列（広）:** 各ケースを **縦にセクション化**（Stitch のブロック順・余白感に合わせる）。各セクションに **アンカー id**（例: `id="case-{slug}"`）を付与し、ナビから **同一ページ内スクロール**で移動できるようにする。
- **About / Contact / Footer:** 既存の順序と役割を維持。ナビの対象は原則 **ケーススタディセクション群のみ**（About 以降はナビに含めない／または末尾リンクのみは実装判断で任意）。

## 4. Navigation behavior and routing

- **既定:** ナビ項目の **主操作はアンカーへスクロール**（`/portfolio#case-{slug}`）。**副操作またはセクション内 CTA** で **`/portfolio/work/[slug]`** に遷移（詳細は既存設計のまま）。
- **現在位置の検出:** **`IntersectionObserver`** を用い、ビューポート内の優先セクションを「アクティブ」としてナビに反映。実装では `rootMargin` やしきい値を調整し、**ちらつき**を抑える。
- **フォールバック:** JS が無効、または Observer が使えない環境では **ナビは通常のリンク**として機能すればよい（ハイライトは省略可）。`prefers-reduced-motion: reduce` では **スムーススクロールを無効化**し、既存 `portfolio.css` の方針に合わせる。

## 5. Responsive behavior

- **狭いビューポート:** 2 カラムをやめ、**ヒーロー →モバイル用ナビ（横スクロールのチップ／短いラベル列など）→ ケース本文**の順にスタック。ナビは **画面上部に sticky** するか、**最初のケース直前に固定帯**とするかは実装で選択（いずれも **一覧への到達性**を優先）。
- **タッチターゲット**と **横スクロールのキーボード操作**に配慮（必要なら `scroll-snap` は任意）。

## 6. Accessibility

- 一覧ナビは **`nav` 要素**と **`aria-label`（日本語）** でラベル付け。
- アンカー移動後の **`h2`/`h3` 見出し階層**が連続アウトラインで破綻しないよう、セクション見出しレベルを設計時に固定する（実装計画で具体化）。
- 既存の **本文へスキップ** リンクは維持。

## 7. Content and assets

- **Stitch ダミーコピー**が入手でき次第、`src/content/case-studies/*.md` の該当フィールドまたは本文に反映する作業を **一括タスク**として扱う。
- **画像:** 既存 `heroImage` を使用。Stitch のプレースホルダ画像 URL は本番では使わない。
- **画面キャプチャ／HTML エクスポート**はリポジトリの `docs/` 外に置くか、取り込む場合は **ライセンスと容量**を確認のうえ `docs/` または `src/assets/` に限定して管理（実装計画で決定）。

## 8. Testing

- **`astro check` と production build** が通ること。
- **手動:** ナビクリックで対象セクションへスクロールし、アクティブ表示が大きく破綻しないこと。詳細ページへのリンクが生きていること。
- **E2E は任意**（コスト対効果が低ければ省略し、回帰時に追加）。

## 9. Open decisions (locked at implementation plan)

- モバイルナビの **具体 UI**（横スクロールチップ vs 折りたたみ）と **sticky の基準位置**。
- ナビラベルが長い場合の **省略表記**ルール（`truncate` / 2 行まで / 短縮タイトルフィールドの追加は YAGNI で避けるか）。

## 10. Self-review checklist

- **プレースホルダ:** 未定の数値トークンや「後で決める」だけの箇所はセクション 9 に集約済み。
- **一貫性:** 一覧はアンカー主、詳細は既存 URL — 既存 case study detail spec と矛盾しない。
- **スコープ:** `/portfolio` 一覧のレイアウト＋ナビ＋コピー方針 B に限定。
- **解釈の余地:** 「Stitch に寄せる」は **レイアウト優先度と文案**であり、色・フォントはサイト側。
