# Radix テーマ・テーマトグル・Lighthouse 改善 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@radix-ui/colors` の Sage / Indigo のみでトークンを再構成し、localStorage と初回 `prefers-color-scheme` に基づくライト／ダーク切替（ボタンのみ）を実装し、既知の a11y 指摘を解消したうえで Lighthouse（SEO 以外）を追跡できる状態にする。

**Architecture:** Radix の配布 CSS を `@import` し、`html` に `light` または `dark` を付けて Sage／Indigo のスケール変数が切り替わるようにする。未保存ユーザーは OS の明暗を初期値にし、トグルで `localStorage` に保存して以降はそれを優先する。ナビには Starwind `Button` のアイコンサイズでテーマボタンを置く。a11y はフッターのコントラストとケーススタディ CTA の accessible name を直接修正する。

**Tech Stack:** Astro 6、Tailwind CSS v4（`src/styles/styles.css` の `@theme`）、Bun、`@radix-ui/colors`、Starwind Button（`src/components/starwind/button/Button.astro`）。

---

## ファイル構成（実装前の地図）

| ファイル | 責務 |
|----------|------|
| `package.json` / `bun.lock` | `@radix-ui/colors` 依存 |
| `src/styles/styles.css` | Radix の import、`@theme` のセマンティックエイリアス、既存の `html.dark { ... }` 手書き hex の削除 |
| `src/layouts/PortfolioLayout.astro` | FOUC 防止用インラインスクリプト、`html` のクラスから固定 `light` をやめる（スクリプトが付与） |
| `src/components/portfolio/ThemeToggleButton.astro`（新規） | Starwind `Button` + クリックでテーマ反転 + `localStorage` |
| `src/components/portfolio/PortfolioTopNav.astro` | デスクトップ：`について` リンクの直左に `ThemeToggleButton`。モバイル：同順序になるよう `について` の直前に配置 |
| `src/components/portfolio/PortfolioFooter.astro` | 準備中スパンの前景色（`text-border-default` 廃止） |
| `src/components/portfolio/PortfolioCaseStudy.astro` | CTA の `aria-label` と可见テキストの整合 |
| `CLAUDE.md` | Design Context の「テーマ」記述を「ボタン切替 + 初回 OS 参照」に更新（数行） |

---

### Task 1: 依存関係と Radix の変数名確認

**Files:**
- Modify: `package.json`
- Modify: `bun.lock`（`bun install` により更新）

- [ ] **Step 1: パッケージ追加**

```bash
cd /Users/kazkiueda/Sources/github.com/themeaningof8/kazkiueda_com && bun add @radix-ui/colors@3.0.0
```

期待: `package.json` の `dependencies` に `"@radix-ui/colors": "3.0.0"` が追加される。

- [ ] **Step 2: 変数名を確認（実装の前提）**

```bash
head -15 node_modules/@radix-ui/colors/sage.css
head -15 node_modules/@radix-ui/colors/sage-dark.css
head -15 node_modules/@radix-ui/colors/indigo.css
head -15 node_modules/@radix-ui/colors/indigo-dark.css
```

期待: ライトは `:root, .light, .light-theme` に `--sage-*` / `--indigo-*`、ダークは `.dark, .dark-theme` に同じキーで別値。（v3.0.0 で確認済みの形式: `--sage-1` … `--sage-12`。）

- [ ] **Step 3: コミット**

```bash
git add package.json bun.lock
git commit -m "deps: add @radix-ui/colors for Sage and Indigo scales"
```

---

### Task 2: `styles.css` に Radix を読み込み、`@theme` を変数参照のみにする

**Files:**
- Modify: `src/styles/styles.css`

**方針:** `@import 'tailwindcss'` の直後（既存の `@import` 順を崩さないよう、`@theme` より前）に次を追加する。

```css
@import '@radix-ui/colors/sage.css';
@import '@radix-ui/colors/sage-dark.css';
@import '@radix-ui/colors/indigo.css';
@import '@radix-ui/colors/indigo-dark.css';
```

`@theme` 内のセマンティックトークンを、手書き hex ではなく **Radix のステップ**にマッピングする（現行の Sage ベースの意味を保つ例。実装時はコントラストを目視／axe で確認すること）。

| セマンティック | ライト（例） | ダーク（`.dark` 時は Radix が上書き） |
|----------------|--------------|--------------------------------------|
| `--color-surface-canvas` | `var(--sage-1)` | （`sage-dark` により `--sage-1` がダーク用に） |
| `--color-surface-subtle` | `var(--sage-2)` | 同上 |
| `--color-surface-ui` | `var(--sage-3)` | 同上 |
| `--color-surface-ui-hover` | `var(--sage-4)` | 同上 |
| `--color-surface-ui-active` | `var(--sage-5)` | 同上 |
| `--color-border-subtle` | `var(--sage-6)` | 同上 |
| `--color-border-default` | `var(--sage-7)` | 同上 |
| `--color-border-strong` | `var(--sage-8)` | 同上 |
| `--color-fg-muted` | `var(--sage-11)` | 同上 |
| `--color-fg-strong` | `var(--sage-12)` | 同上 |
| `--color-accent`（リンク・アウトライン系） | `var(--indigo-11)` または `var(--indigo-10)` | `indigo-dark.css` の `--indigo-*` |
| `--color-accent-hover` | `var(--indigo-12)` 等 | 同上 |
| `--color-accent-surface`（ソリッド） | `var(--indigo-9)` | 同上 |
| `--color-accent-surface-hover` | `var(--indigo-10)` | 同上 |
| `--color-fg-on-accent` | `#ffffff`（Indigo 9 上の白は WCAG 上問題になりにくい） | 同上 |

- [ ] **Step 1:** 上記 import を追加する。
- [ ] **Step 2:** `@theme` の hex をすべて `var(--sage-*)` / `var(--indigo-*)` に置換する。
- [ ] **Step 3:** ファイル末尾付近の `html.dark, .dark { ... }` ブロック（手書き hex の上書き）を**削除**する。ダーク配色は Radix の `sage-dark.css` / `indigo-dark.css` に任せ、`html` に `dark` クラスが付く前提に統一する。
- [ ] **Step 4:** `--color-error` / `--color-error-foreground` を仕様どおり **Sage と Indigo のみ**で表現する（例: 背景 `var(--sage-3)`、前景 `var(--sage-12)`、または境界で `var(--indigo-8)`）。独自 `#9d4745` は削除する。
- [ ] **Step 5: 検証**

```bash
bun run check
bun run build
```

期待: エラーなく完了。

- [ ] **Step 6: コミット**

```bash
git add src/styles/styles.css
git commit -m "style: map theme tokens to Radix Sage and Indigo scales"
```

---

### Task 3: FOUC 防止スクリプトと `html` クラス — `PortfolioLayout.astro`

**Files:**
- Modify: `src/layouts/PortfolioLayout.astro`

**ストレージキー例:** `kazkiueda-theme`（値は `'light'` | `'dark'` のみ）。

- [ ] **Step 1:** `<head>` 内のできるだけ早い位置（`<meta charset>` の直後が望ましい）に **インラインスクリプト**を追加する。内容の要点:
  - `localStorage.getItem('kazkiueda-theme')` が `'light'` または `'dark'` ならそれを採用。
  - それ以外（初回）は `matchMedia('(prefers-color-scheme: dark)').matches` で `dark` / `light` を決定。
  - `document.documentElement.classList.remove('light', 'dark');`
  - `document.documentElement.classList.add(chosenTheme);`
  - `document.documentElement.style.colorScheme = chosenTheme === 'dark' ? 'dark' : 'light';`

```html
<script is:inline>
  (function () {
    var k = 'kazkiueda-theme';
    var stored = typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null;
    var theme =
      stored === 'light' || stored === 'dark'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  })();
</script>
```

- [ ] **Step 2:** `<html>` の開始タグから固定の `class="light ..."` をやめ、**トランジション等に必要なクラスだけ**残す。例:

```html
<html
  class="motion-safe:scroll-smooth"
  lang="ja"
  transition:name="root"
  transition:animate="none"
>
```

テーマの `light` / `dark` はスクリプトが付与する。

- [ ] **Step 3: 検証** — 開発サーバーでハードリロードし、DevTools Application → Local Storage をクリアした状態で OS の明暗が初期テーマに反映されること、トグル後（Task 4 実装後）に保存値が効くことを確認する。

- [ ] **Step 4: コミット**

```bash
git add src/layouts/PortfolioLayout.astro
git commit -m "feat(layout): resolve theme from storage or prefers-color-scheme"
```

---

### Task 4: `ThemeToggleButton.astro`（Starwind Button）

**Files:**
- Create: `src/components/portfolio/ThemeToggleButton.astro`

- [ ] **Step 1:** 新規ファイルを作成。`Button` を import し、`variant="outline"`、`size="icon"`（または `icon-sm`）、`type="button"`、適切な `aria-label`（例: 「ダークテーマに切り替え」／「ライトテーマに切り替え」は JS で更新）。

```astro
---
import Button from '../starwind/button/Button.astro';
---
<Button
  id="theme-toggle"
  type="button"
  variant="outline"
  size="icon"
  aria-label="テーマを切り替え"
>
  <span class="material-symbols-outlined text-base" aria-hidden="true" data-theme-icon
    >light_mode</span
  >
</Button>
<script>
  const KEY = 'kazkiueda-theme';
  const root = document.documentElement;
  function currentTheme() {
    return root.classList.contains('dark') ? 'dark' : 'light';
  }
  function syncUi(theme) {
    var icon = document.querySelector('[data-theme-icon]');
    var btn = document.getElementById('theme-toggle');
    if (icon && btn) {
      icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'ライトテーマに切り替え' : 'ダークテーマに切り替え',
      );
    }
  }
  function applyTheme(theme) {
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    localStorage.setItem(KEY, theme);
    syncUi(theme);
  }
  document.getElementById('theme-toggle')?.addEventListener('click', function () {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
  syncUi(currentTheme());
</script>
```

`syncUi(theme)` は `localStorage` を触らず、アイコンと `aria-label` だけを更新する。初回表示はレイアウトのインラインスクリプトが既に `html` クラスを付けているため、`syncUi` のみ呼ぶ。

注意: 上記 `<script>` は Astro の処理対象なので、型エラーが出たら `theme: 'light' | 'dark'` 注釈を外す。

- [ ] **Step 2:** `applyTheme` はクリック時のみ `localStorage.setItem` する。ページロード時は `syncUi` のみ。

- [ ] **Step 3: 検証** — `bun run build` が通ること。クリックで `html` の `light`/`dark` が切り替わること。

- [ ] **Step 4: コミット**

```bash
git add src/components/portfolio/ThemeToggleButton.astro
git commit -m "feat(portfolio): add theme toggle button with Starwind Button"
```

---

### Task 5: `PortfolioTopNav` にテーマボタンを配置

**Files:**
- Modify: `src/components/portfolio/PortfolioTopNav.astro`

- [ ] **Step 1:** `ThemeToggleButton` を import。
- [ ] **Step 2:** デスクトップ `nav`（`class="hidden ... md:flex"`）内で、`aboutHref` の `<a>` の**直前**に `<ThemeToggleButton />` を挿入する。
- [ ] **Step 3:** モバイル下部ナビの `<ul>` 内で、`について` の `<li>` の**直前**に `<li><ThemeToggleButton /></li>` を挿入する（「について」の左）。

- [ ] **Step 4: 検証** — 狭いビューと広いビューでボタンが意図どおり見えること。キーボードでフォーカス可能であること。

- [ ] **Step 5: コミット**

```bash
git add src/components/portfolio/PortfolioTopNav.astro
git commit -m "feat(portfolio): place theme toggle left of About link"
```

---

### Task 6: フッター準備中テキストのコントラスト

**Files:**
- Modify: `src/components/portfolio/PortfolioFooter.astro`

- [ ] **Step 1:** 準備中の `<span>` の `text-border-default` をやめ、`text-fg-muted` に変更する（または `text-fg-muted/80` ではなく、**4.5:1 以上**が取れる実用的なステップのみ。必要なら Radix の `sage-11` を直接 `style` ではなく Tailwind のトークン経由で）。

現在:

```astro
class="... text-border-default uppercase"
```

変更後の例:

```astro
class="... text-fg-muted uppercase opacity-90"
```

※ `opacity` で落とすと再びコントラスト不足になる可能性があるため、**opacity は使わず** `text-fg-muted` 単体で確認すること。

- [ ] **Step 2: 検証** — Lighthouse の color-contrast が該当要素でパスするか確認（Task 9）。

- [ ] **Step 3: コミット**

```bash
git add src/components/portfolio/PortfolioFooter.astro
git commit -m "fix(a11y): use muted foreground for disabled footer links"
```

---

### Task 7: ケーススタディ CTA の accessible name

**Files:**
- Modify: `src/components/portfolio/PortfolioCaseStudy.astro`

- [ ] **Step 1:** `aria-label={caseStudyAriaLabel}` だけでは visible の「ケーススタディを見る」と一致しないため、次のいずれかで解消する。
  - **推奨 A:** `aria-label` を削除し、リンク内の可见テキストだけで十分とする（記事タイトルは別要素にあるため、必要なら親の見出しで文脈が取れるか確認）。
  - **推奨 B:** `aria-label={`${linkLabel ?? 'ケーススタディを見る'}: ${caseStudyAriaLabel}`}` のように**可见ラベルを accessible name に含める**。

- [ ] **Step 2: コミット**

```bash
git add src/components/portfolio/PortfolioCaseStudy.astro
git commit -m "fix(a11y): align case study CTA accessible name with visible label"
```

---

### Task 8: `CLAUDE.md` の Design Context を1段落更新

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1:** 「prefers-color-scheme に追従」を**唯一の**目標として書いている箇所があれば、**「初回のみ OS を参照し、以降はヘッダのボタンと localStorage で切替」**に書き換える。

- [ ] **Step 2: コミット**

```bash
git add CLAUDE.md
git commit -m "docs: clarify theme toggle vs system preference"
```

---

### Task 9: Lighthouse（CLI）と退行確認

**Files:**
- コマンドのみ（ドキュメント化は任意）

- [ ] **Step 1: ビルドとプレビュー**

```bash
bun run build
bun run preview -- --host 127.0.0.1 --port 4321
```

- [ ] **Step 2: SEO を除くカテゴリで計測**

```bash
npx lighthouse http://127.0.0.1:4321/case-study \
  --only-categories=performance,accessibility,best-practices \
  --screenEmulation.mobile \
  --output html \
  --output-path ./lighthouse-report.html
```

期待: Accessibility の `color-contrast` と `label-content-name-mismatch` が解消していること。Performance は環境依存のため、**スコアの絶対値よりも**「改善した項目（未使用 CSS 等）」を参照する。

- [ ] **Step 3:** レポートを確認したらプレビューサーバを停止する。

---

## Spec との対応（カバレッジ）

| Spec の要件 | タスク |
|-------------|--------|
| Sage / Indigo のみ、公式 import | Task 1–2 |
| 初回 OS、トグルで localStorage、ボタンのみ | Task 3–5 |
| フッター／CTA の a11y | Task 6–7 |
| Lighthouse（SEO 以外）追跡 | Task 9 |
| ドキュメント整合 | Task 8 |

---

## 自己レビュー（プレースホルダ禁止）

- 具体ファイルパス・コマンド・コード断片を記載済み。
- Radix の変数名は v3.0.0 の `head` で確認する手順を含む。
- ThemeToggle のスクリプトはプロジェクトの厳密な型設定で失敗する場合があるため、実装時に型を外す旨を記載済み。

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-18-radix-theme-implementation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — タスクごとに新しいサブエージェントを投げ、タスク間でレビューする。

**2. Inline Execution** — このセッションで `executing-plans` に沿って連続実装する。

どちらで進めますか？
