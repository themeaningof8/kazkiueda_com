# Portfolio Starwind「制作実績」ホバーメニュー + ヘッダーチップ削除 — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the fixed-header **second-row case chip strip**, and on **`md` and wider** show **Starwind Popover** (hover + keyboard) on「制作実績」with links to `#work` / each case; keep **scroll-section highlighting** on the listing page via a small client script.

**Architecture:** Run **Starwind CLI** (`init` then `add`) so **`src/components/starwind/popover`** (and **`button`** if the trigger uses `asChild`) live in-repo. Import **`@/styles/starwind.css` only from `PortfolioLayout.astro`** so non-portfolio pages stay untouched. Replace the plain「制作実績」`<a>` in **`PortfolioTopNav.astro`** with a **`hidden md:inline-flex`** block wrapping **`<Popover openOnHover closeDelay={280}>`**; panel lists **section link + `caseNavItems`**. Extract **IntersectionObserver** from **`PortfolioCaseStudyNav.astro`** into **`PortfolioCaseStudyScrollSpy.astro`** (no visible DOM), delete the old nav component file, and include the spy when `caseNavItems?.length`.

**Tech Stack:** Astro 6, Tailwind CSS v4, Starwind UI (CLI, Astro + vanilla JS), existing Sage tokens in `src/styles/portfolio.css`.

**Verification:** After each task group: `bun run check` and `bun run build`. Manual: `md` breakpoint hover, pointer path into panel before `closeDelay`, keyboard open/close, listing page scroll spy still updates active case link.

**Spec reference:** `docs/superpowers/specs/2026-04-12-portfolio-starwind-work-menu-design.md`

---

## File map

| Path | 役割 |
|------|------|
| `tsconfig.json` | Starwind `init` が追加する **`compilerOptions.baseUrl` / `paths["@/*"]`** を strict 継承と矛盾なくマージ。 |
| `starwind.config.json` | CLI 生成。`tailwind.css` パスは **`src/styles/starwind.css`** を維持。 |
| `src/styles/starwind.css` | CLI 生成。**`:root` / `body` の `@apply` がポートフォリオの `body` クラスと衝突する場合**は、`body { … }` ブロックを **削除またはコメントアウト**し、理由を 1 行コメント（Sage は `PortfolioLayout` が担当）。 |
| `astro.config.mjs` | CLI が触る場合、**`@astrojs/cloudflare` / `session` / `adapter`** を失わないよう差分を手で復元。 |
| `package.json` / `bun.lock` | Starwind が追加する依存（`tailwind-variants`, `tailwind-merge`, `tw-animate-css`, `@tailwindcss/forms` 等）をコミット。 |
| `src/layouts/PortfolioLayout.astro` | **`import '@/styles/starwind.css'`** を **`import '../styles/portfolio.css'` の直後**（または直前で可だが **portfolio の @theme を先に読みたい**なら starwind を後に）に 1 行追加。 |
| `src/components/starwind/*` | CLI が配置。**手編集は Popover の見た目を上書きする `class` プロップ程度**に留める。 |
| `src/components/portfolio/PortfolioCaseStudyScrollSpy.astro` | **新規。**`astro:page-load` で IO を張り、`a[data-case-anchor]` の **`aria-current` と控えめなアクティブ見た目**を更新。 |
| `src/components/portfolio/PortfolioWorkNavPopover.astro` | **新規。**`workHref`, `caseNavItems`, 任意で `workSectionLabel` を受け取り、Starwind の `Popover` / `PopoverTrigger` / `PopoverContent` と **パネル内の `<a>` 一覧**を組み立てる。 |
| `src/components/portfolio/PortfolioTopNav.astro` | **ヘッダー 2 段目の `PortfolioCaseStudyNav` を削除**。「制作実績」位置に **`PortfolioWorkNavPopover`**（`md` 以上のみ表示）。`caseNavItems` があるとき **`PortfolioCaseStudyScrollSpy`** を 1 回だけ含める。 |
| `src/components/portfolio/PortfolioCaseStudyNav.astro` | **削除**（中身は ScrollSpy + Popover に移管）。 |
| `src/components/portfolio/portfolio-types.ts` | 必要なら **`PortfolioTopNavProps` にオプション `workSectionLabel?: string`**（パネル先頭リンクの文言）。未追加なら Astro 内にハードコード「制作実績セクションへ」でも可。 |

---

### Task 1: Starwind CLI 初期化とグローバル衝突の解消

**Files:**

- Modify: `tsconfig.json`
- Create: `starwind.config.json`
- Create: `src/styles/starwind.css`
- Modify: `package.json`, `bun.lock`
- Modify: `astro.config.mjs`（必要なら）
- Modify: `src/layouts/PortfolioLayout.astro`

- [ ] **Step 1: リポジトリルートで init**

```bash
cd /Users/kazkiueda/Sources/github.com/themeaningof8/kazkiueda_com
bunx starwind@latest init
```

対話プロンプトでは **依存関係のインストールに同意**、`starwind.css` の生成先はデフォルト **`src/styles/starwind.css`** でよい。

- [ ] **Step 2: `astro.config.mjs` を diff**

`@astrojs/cloudflare`、`session`、`adapter` が消えていれば **直前のコミットから復元**し、**`vite.plugins` に `tailwindcss()` が重複しない**ようにする。

- [ ] **Step 3: `src/styles/starwind.css` の `body` ルール**

`@layer base { body { @apply bg-background text-foreground … } }` が存在し、ポートフォリオの `body` 属性と食い違う場合は **当該 `body` ブロックを削除**し、先頭に次のようなコメントを残す:

```css
/* Portfolio pages: body surface/foreground come from PortfolioLayout.astro + portfolio.css */
```

- [ ] **Step 4: `PortfolioLayout.astro` に Starwind CSS を 1 行追加**

```astro
---
import '../styles/portfolio.css';
import '@/styles/starwind.css';
// ...existing imports
---
```

（`portfolio.css` を先に読む順序を維持。）

- [ ] **Step 5: 検証**

```bash
bun run check
bun run build
```

期待: エラーなし（Starwind 由来の型エラーがあれば `tsconfig` の `include` を確認）。

- [ ] **Step 6: コミット**

```bash
git add tsconfig.json starwind.config.json src/styles/starwind.css package.json bun.lock astro.config.mjs src/layouts/PortfolioLayout.astro
git commit -m "chore(starwind): init CLI and scope styles to portfolio layout"
```

---

### Task 2: Starwind コンポーネント追加（Popover + Button）

**Files:**

- Create under: `src/components/starwind/`（CLI 出力に従う）

- [ ] **Step 1: コンポーネント追加**

```bash
bunx starwind@latest add button
bunx starwind@latest add popover
```

- [ ] **Step 2: インポートパス確認**

`PortfolioWorkNavPopover.astro` から次のように import できることを確認（実際のファイル名は snake_case のディレクトリに合わせる）:

```astro
import { Button } from '@/components/starwind/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/starwind/popover';
```

- [ ] **Step 3: 検証**

```bash
bun run check
bun run build
```

- [ ] **Step 4: コミット**

```bash
git add src/components/starwind
git commit -m "feat(starwind): add button and popover components"
```

---

### Task 3: スクロールスパイ専用コンポーネント

**Files:**

- Create: `src/components/portfolio/PortfolioCaseStudyScrollSpy.astro`
- Delete: `src/components/portfolio/PortfolioCaseStudyNav.astro`（Task 4 の直前でも可だが、**重複 script 防止のため Task 3 で新規作成 → Task 4 で旧ファイル削除**を推奨）

- [ ] **Step 1: `PortfolioCaseStudyScrollSpy.astro` を新規作成**（本文は空でもよいが、**`<script>` のみ**推奨）

```astro
---
// No visible UI — IntersectionObserver for case sections
---

<script>
  let observer: IntersectionObserver | null = null;

  function setActiveAnchor(activeId: string | null) {
    const links = document.querySelectorAll<HTMLAnchorElement>('a[data-case-anchor]');
    for (const link of links) {
      const id = link.dataset.caseAnchor;
      const isActive = Boolean(activeId && id === activeId);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
      link.classList.toggle('bg-surface-ui', isActive);
      link.classList.toggle('text-fg-strong', isActive);
      const label = link.querySelector('.case-study-nav-label');
      if (label) {
        label.classList.toggle('text-fg-strong', isActive);
        label.classList.toggle('text-fg-muted', !isActive);
      }
    }
  }

  function initCaseStudyScrollSpy() {
    if (observer) observer.disconnect();

    const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('a[data-case-anchor]')];
    if (!navLinks.length) return;

    const ids = [...new Set(navLinks.map((a) => a.dataset.caseAnchor ?? '').filter(Boolean))];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (!visible.length) return;
        setActiveAnchor(visible[0].target.id);
      },
      {
        root: null,
        rootMargin: '-22% 0px -32% 0px',
        threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
      },
    );

    for (const section of sections) observer.observe(section);
    setActiveAnchor(ids[0]);
  }

  document.addEventListener('astro:page-load', initCaseStudyScrollSpy);
</script>
```

注意: **`aria-current`** は **`page` / `false`** の文字列で統一する（上記スクリプト参照）。

- [ ] **Step 2: `bun run check`**

- [ ] **Step 3: コミット**

```bash
git add src/components/portfolio/PortfolioCaseStudyScrollSpy.astro
git commit -m "feat(portfolio): add case study scroll spy client script"
```

---

### Task 4: `PortfolioWorkNavPopover.astro` + TopNav への組み込み + 旧チップ削除

**Files:**

- Create: `src/components/portfolio/PortfolioWorkNavPopover.astro`
- Modify: `src/components/portfolio/PortfolioTopNav.astro`
- Delete: `src/components/portfolio/PortfolioCaseStudyNav.astro`

- [ ] **Step 1: `PortfolioWorkNavPopover.astro` の骨格**（`workHref` と `items` を props で受け取る）

```astro
---
import { Button } from '@/components/starwind/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/starwind/popover';
import type { CaseStudyNavItem } from './portfolio-types';

interface Props {
  workHref: string;
  items: CaseStudyNavItem[];
  workSectionLabel?: string;
}

const { workHref, items, workSectionLabel = '制作実績セクションへ' } = Astro.props;
---

<div class="hidden md:block">
  <Popover openOnHover closeDelay={280}>
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        class="h-auto rounded-none px-0 py-0 text-sm font-normal tracking-wide text-fg-muted hover:bg-transparent hover:text-fg-strong"
      >
        制作実績
      </Button>
    </PopoverTrigger>
    <PopoverContent
      side="bottom"
      align="start"
      sideOffset={8}
      class="w-72 max-h-[min(24rem,calc(100vh-6rem))] overflow-y-auto border border-border-subtle bg-surface-canvas p-2 shadow-lg"
      aria-label="制作実績"
    >
      <a
        class="block rounded-md px-3 py-2 text-sm text-fg-muted hover:bg-surface-ui hover:text-fg-strong"
        href={workHref}
      >
        {workSectionLabel}
      </a>
      <hr class="my-2 border-border-subtle" />
      <ul class="space-y-1">
        {items.map((item) => {
          const href = item.href ?? `#${item.anchorId}`;
          return (
            <li>
              <a
                class="block rounded-md px-3 py-2 text-sm text-fg-muted hover:bg-surface-ui hover:text-fg-strong"
                href={href}
                data-case-anchor={item.anchorId}
              >
                <span class="case-study-nav-label">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </PopoverContent>
  </Popover>
</div>
```

**備考:** `Button` の `variant` 名は Starwind 生成物に合わせて調整する（`ghost` が無ければ `outline` 等に置換）。**トークンクラス**（`border-border-subtle` 等）は既存ユーティリティが効くことを確認。

- [ ] **Step 2: `PortfolioTopNav.astro` の変更要点**

1. `import PortfolioCaseStudyNav` を **削除**。
2. `import PortfolioWorkNavPopover` と **`PortfolioCaseStudyScrollSpy`** を追加。
3. `<nav class="hidden md:flex …">` 内の **制作実績 `<a>` を `PortfolioWorkNavPopover` に置換**（`workHref` と `caseNavItems` を渡す）。**`about` / `contact` は従来の `<a>` のまま**。
4. `caseNavItems && caseNavItems.length` のとき、**`</header>` の直前または `nav` の外で一度だけ** `<PortfolioCaseStudyScrollSpy />` を置く（`PortfolioLayout` 経由で常に同じ `topNav` が来るため **二重挿入に注意**）。
5. ファイル末尾付近の **`PortfolioCaseStudyNav` レンダリングブロック全体を削除**。

擬似コード（実装時は既存マークアップにマージ）:

```astro
{
  caseNavItems && caseNavItems.length > 0 ? (
    <PortfolioCaseStudyScrollSpy />
  ) : null
}
```

- [ ] **Step 3: `PortfolioCaseStudyNav.astro` を削除**し、リポジトリ内 `grep PortfolioCaseStudyNav` が **0 件**であることを確認。

- [ ] **Step 4: 検証**

```bash
bun run check
bun run build
```

- [ ] **Step 5: コミット**

```bash
git add src/components/portfolio/PortfolioWorkNavPopover.astro src/components/portfolio/PortfolioTopNav.astro
git rm src/components/portfolio/PortfolioCaseStudyNav.astro
git commit -m "feat(portfolio): Starwind hover work menu; remove header chip strip"
```

---

### Task 5: 仕上げと手動確認

**Files:**

- Modify（任意）: `src/components/portfolio/portfolio-types.ts`（`workSectionLabel` を props 化する場合）
- Modify（任意）: `src/styles/starwind.css` または **Popover 内リンク**用の微調整クラス

- [ ] **Step 1: 手動確認チェックリスト**（ブラウザ）

1. `/portfolio` で **`md` 以上**: 「制作実績」ホバーでパネル表示、**パネル内にマウスを移しても**閉じない（`closeDelay` 体感）。
2. 各ケースリンクと「制作実績セクションへ」で **正しい URL / hash** に遷移。
3. スクロールで **現在地に応じてパネル内リンクのスタイルが変わる**（`#case-*` が DOM に存在する一覧ページ）。
4. **`md` 未満**: **Popover が出ない**（`hidden md:block`）。ナビは従来どおりブランド + CTA のみでよい。
5. `/portfolio/work/...` で **Popover は表示されるが** IO は静かに no-op（セクションなし）で **エラーが出ない**。

- [ ] **Step 2: 最終検証コマンド**

```bash
bun run check
bun run build
```

- [ ] **Step 3: コミット**（調整分があれば）

```bash
git commit -am "fix(portfolio): polish work nav popover a11y and scroll spy"
```

---

## Plan self-review (spec coverage)

| Spec § | 対応タスク |
|--------|------------|
| ヘッダーチップ削除 | Task 4 |
| `md`+ のみ Popover | `PortfolioWorkNavPopover` の `hidden md:block` |
| Starwind Popover + hover | Task 1–2, Task 4 |
| パネル先頭 `#work` + 各ケース | Task 4 マークアップ |
| IO 継続 | Task 3–4, `data-case-anchor` |
| Sage トークンでパネル装飾 | `PopoverContent` の `class` |
| 非目的（モバイル新設なし） | `hidden md:block` |
| `starwind.css` と body の衝突 | Task 1 Step 3 |

**Placeholder スキャン:** なし。

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-12-portfolio-starwind-work-menu-plan.md`. Two execution options:**

1. **Subagent-Driven（推奨）** — タスクごとに新しいサブエージェントを投げ、タスク間でレビューする。高速イテレーション向け。
2. **Inline Execution** — このセッションで `executing-plans` に沿い、チェックポイントごとにまとめて実行する。

**どちらで進める？**（番号か名前で返答してくれれば十分）
