# Radix Colors テーマ・ライト／ダーク切替・Lighthouse（SEO 以外）設計

**Date:** 2026-04-18  
**Status:** Approved for implementation planning  
**Scope:** `@radix-ui/colors` に基づく色の一元化（Sage / Indigo のみ）、明示的テーマトグル、Chrome Lighthouse の Performance・Accessibility・Best Practices の改善方針。SEO カテゴリは意図的な `noindex` 等により満点を狙わない。

---

## 1. 背景と目的

- **ブランド／実装の一貫性:** 任意の hex を増やさず、Radix Colors のスケールと公式 import に寄せる。
- **テーマ:** ライト／ダークをユーザーが選べるようにする（現状はトークンのみ部分的に存在）。
- **品質:** Lighthouse で **SEO を除く**カテゴリを高水準にし、計測・原因特定の手順を固定する。

`CLAUDE.md` の Design Context（落ち着き・信頼・WCAG 2.2 AA）と矛盾しない範囲で進める。

---

## 2. カラー・トークン方針

### 2.1 許可される Radix スケール（このプロジェクトで使うのは次のみ）

| 用途 | Radix scale | npm パッケージ上の import |
|------|----------------|---------------------------|
| グレー系・面・境界・ニュートラル本文まわり | **Sage**（および Sage Dark） | `@radix-ui/colors` の `sage.css` / `sage-dark.css` 等（公式 Installation に従う） |
| アクセント・プリミティブ（リンク強調・ソリッド CTA・フォーカスリング等） | **Indigo**（および Indigo Dark） | 同様に `indigo` / `indigo-dark` |

**これ以外の色相スケール（例: Grass、Ruby、別グレー）は使わない。**  
エラー・警告・破壊的操作も **Sage と Indigo のステップの組み合わせ**で表現する（例: 強いニュートラルコントラスト、Indigo の別ステップ）。独自 hex を増やさない。

### 2.2 実装ルール

1. **`bun add @radix-ui/colors`** を前提とし、[Radix Colors Installation](https://www.radix-ui.com/colors/docs/overview/installation) のとおり **`@import`** で必要なスケールのみ読み込む。
2. **`src/styles/styles.css` の `@theme`**: プロジェクト固有のセマンティック名（例: `--color-surface-canvas`）は **`var(--sage-*)` / `var(--indigo-*)` へのエイリアスのみ**とする。手書き hex は置かない（Radix が定義する変数名はパッケージ実装に合わせて実装計画で確定する）。
3. **コンポーネント／ページ**: `text-[#...]` のような任意色は禁止に近い運用とする。Tailwind はセマンティックトークン経由（現行の `text-fg-strong` 等を Sage／Indigo ベースに再マップ）。

### 2.3 Starwind

- `starwind.config.json` の `baseColor: "neutral"` 等は、**最終的な見た目は `@theme` の CSS 変数が支配する**前提で、必要なら Starwind 側の整合（生成コンポーネントが参照する変数名）を実装フェーズで調整する。
- **Button** など Starwind コンポーネントは、トークン変更後も **primary / outline が Indigo／Sage の意味と一致する**ように変える。

---

## 3. ライト／ダークの挙動

### 3.1 初期値（採用: B）

- **初回訪問（`localStorage` にテーマ未保存）:** `prefers-color-scheme` に合わせてライトまたはダークを適用する。
- **ユーザーが一度でもトグルした後:** **`localStorage` に保存した値が優先**する。

### 3.2 切り替え手段

- **サイト上部のボタンのみ**でライト／ダークを切り替えられるようにする。
- OS の設定変更だけで **自動的にテーマが追従し続ける**挙動は採用しない（未保存ユーザーについては初回のみ OS を参照してよい）。

### 3.3 UI 仕様

- **配置:** サイト上部ナビで **About ページへのリンクの左隣**。
- **実装:** Starwind の **Button** コンポーネントを使用する。
- **実装詳細**（ストレージキー、`html` のクラス、`color-scheme`、CLS 回避のためのインラインスクリプトの要否）は実装計画で確定する。

---

## 4. Lighthouse（SEO 以外）

### 4.1 対象カテゴリ

- **Performance**
- **Accessibility**
- **Best Practices**

SEO は `noindex`・メタ説明欠如など **要件として許容している項目**があるため、本設計の「100」の対象外とする。

### 4.2 計測手段

- **Chrome DevTools MCP の `lighthouse_audit` は Performance カテゴリを含まない**ため、Performance のスコア検証には **Lighthouse CLI** または **Chrome の Lighthouse パネル**を用いる。
- **モバイルを主**とし、本番または本番に近いホスト・キャッシュ条件下での計測結果を正とする（ローカル `astro preview` のみは参考）。

### 4.3 既知の調査結果（ベースライン）

**Accessibility（例: `/case-study`、ローカル preview）**

- **コントラスト:** フッターの「準備中」ソーシャル表示が、薄いグレー前景 × 薄い背景で **WCAG のコントラスト要件を満たさない**検出がある。Radix Sage へ寄せたうえで **ミュート／無効テキストのステップ選定を見直す**。
- **名前と表示ラベル:** ケーススタディカードの CTA で **`aria-label` と可见テキストが一致しない**検出がある。**ラベルを統一するか `aria-label` をやめる等**で解消する。

**Performance（資産サイズの目安）**

- 集約 CSS が大きめ、Noto Sans JP の **woff2 が多数**、Google Fonts 経由の **Material Symbols** など、バイト数・クリティカルパスの要因がありうる。テーマ変更後に **必要なサブセット・読み込み順**を再確認する。

---

## 5. 成功条件（要約）

1. 色は **Radix Sage / Indigo のみ**（公式 import・変数参照）。トークン以外に任意 hex を増やさない方針で運用できる。
2. **初回は OS の明暗を初期値**、**トグル後は localStorage 優先**。切り替えは **上部ナビの Button（About の左）のみ**。
3. Lighthouse で **Performance・Accessibility・Best Practices** を計測し、本番相当の条件で改善を追跡できる。
4. `CLAUDE.md` のトーン（静か・信頼・テキスト主導）を損なわない。

---

## 6. 非スコープ（本書では固定しない）

- SEO 満点化、`robots` / `noindex` 方針の変更。
- コンテンツそのものの追加・変更。

---

## 7. 次のステップ

実装前に **writing-plans** スキルに従い、依存関係追加・`styles.css` 再構成・ナビへの ThemeToggle・Lighthouse 検証コマンド・a11y 修正の順序をタスク化する。
