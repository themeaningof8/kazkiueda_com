# Portfolio persistent case study nav — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/portfolio` so case studies use a **two-column shell** (persistent nav + main column), **in-page anchors** (`#case-<id>`) as the primary navigation, **detail pages** still reachable from each case block, **active nav highlighting** via `IntersectionObserver`, and **existing Sage tokens only** for color. Copy follows **spec B** (Stitch-aligned dummy text in content + hero when export arrives).

**Architecture:** `index.astro` loads `caseStudies` as today, builds `navItems` from `entry.id` + `entry.data.title`, passes **`sectionId: \`case-${entry.id}\``** into `PortfolioCaseStudy`. New `PortfolioCaseStudyNav.astro` renders **two instances** (mobile chips `md:hidden` sticky strip + desktop rail `hidden md:block` inside a `sticky` wrapper). One bundled **`<script>`** (no npm client framework) listens to `astro:page-load`, disconnects any prior `IntersectionObserver`, and syncs `aria-current` / utility classes across **all** `a[data-case-anchor]` duplicates. `PortfolioCaseStudy` stops using a single outer `<a href={detail}>` around the whole card so nav anchors are not fighting the spec; **View Transitions** stay by wrapping **only the hero `<img>`** (and the new text CTA) in `<a href={href}>`.

**Tech Stack:** Astro 6, Tailwind v4 (`@tailwindcss/vite`), Content Collections (`astro:content`, `astro/zod`), View Transitions (`astro:transitions` / `ClientRouter` already in `PortfolioLayout`).

**Verification note:** このリポジトリに Vitest / Playwright は無い。各タスクのゲートは **`bun run check`** と **`bun run build`**。ナビのハイライトとアンカー飛びは **ブラウザ手動**（幅を `375px` と `1024px` 付近で切替）。

**Spec reference:** `docs/superpowers/specs/2026-04-12-portfolio-persistent-case-study-nav-design.md`

---

## File map

| Path | 役割 |
|------|------|
| `src/components/portfolio/portfolio-types.ts` | `CaseStudy` に **`sectionId: string`**（必須化）を追加。ナビ用の小さな型 `CaseStudyNavItem { anchorId: string; label: string }` をエクスポート。 |
| `src/components/portfolio/PortfolioCaseStudyNav.astro` | **新規。** `variant: 'rail' \| 'chips'` と `items: CaseStudyNavItem[]` を受け取り、`aria-label="ケーススタディ"` の `<nav>` + アンカーリンク。`<script>` で `IntersectionObserver` と `astro:page-load`。 |
| `src/components/portfolio/PortfolioCaseStudy.astro` | `<article id={sectionId}>`。カード全体リンクをやめ、**画像＋「詳細を見る」テキストリンク**のみ `href` へ。`<img>` に既存の `transition:name` を維持。 |
| `src/pages/portfolio/index.astro` | `#work` 内を **12 カラムグリッド**化：モバイル用 `PortfolioCaseStudyNav`（sticky）、デスクトップ用 `aside` + `sticky` ラッパー、メイン列で `PortfolioCaseStudy` を縦積み。`navItems` を `sorted.map` で生成。 |
| `src/styles/portfolio.css` | 必要なら **sticky の安全域**（`scroll-padding-top` など）のみ。まず Tailwind の `scroll-mt-*` で足りるか試し、足りなければ最小追加。 |
| `src/content/case-studies/*.md` | **任意の後続タスク:** Stitch ダミー文案への置換（spec B）。レイアウト実装をブロックしない。 |

---

### Task 1: 型定義の拡張

**Files:**

- Modify: `src/components/portfolio/portfolio-types.ts`

- [ ] **Step 1: 型を次の内容に更新**（`CaseStudy` に `sectionId`、末尾に `CaseStudyNavItem` を追加）

```typescript
export type CaseStudyPreset = '01' | '02' | '03' | '04';

export interface CaseStudy {
  preset: CaseStudyPreset;
  tags: string[];
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  /** 一覧ページ内アンカー用（例: `case-linear-studio`） */
  sectionId: string;
  /** 案件詳細ページ */
  href?: string;
  /** `href` 時の短い `aria-label`（未指定時はタイトルから自動生成） */
  linkLabel?: string;
  /** View Transitions: 一覧カード画像と詳細ヒーローで一致させる名前 */
  transitionName?: string;
}

export interface CaseStudyNavItem {
  anchorId: string;
  label: string;
}

/** `href` が無いときはリンク未設定として `<span>` で描画（キーボードで空の `#` に飛ばない） */
export interface FooterLink {
  label: string;
  href?: string;
}
```

- [ ] **Step 2: 検証（参考）**

```bash
cd /Users/kazkiueda/Sources/github.com/themeaningof8/kazkiueda_com
bun run check
```

期待: `sectionId` を必須にした直後は **`index.astro` 未配線のため型エラーになりうる**。**この Step 2 は失敗してよい**。コミットは **Task 4 の Step 7 の直前に Task 1〜4 をまとめる**か、**各タスク末尾のコミットをその場で行い `check` は Task 4 完了後に必ず通す**。

- [ ] **Step 3: コミット（任意・タイミング）**

単独コミットにする場合:

```bash
git add src/components/portfolio/portfolio-types.ts
git commit -m "feat(portfolio): add sectionId and nav item types"
```

**推奨:** Task 1 の変更は **Task 4 完了までステージのみ**にし、Task 4 Step 7 で `portfolio-types.ts` / `PortfolioCaseStudyNav.astro` / `PortfolioCaseStudy.astro` / `index.astro` を **1 コミット**にまとめる（中間状態で `main` を壊さない）。

---

### Task 2: `PortfolioCaseStudyNav.astro` を新規作成

**Files:**

- Create: `src/components/portfolio/PortfolioCaseStudyNav.astro`

- [ ] **Step 1: ファイルを新規作成**（そのまま保存）

```astro
---
import type { CaseStudyNavItem } from './portfolio-types';

interface Props {
  items: CaseStudyNavItem[];
  variant: 'rail' | 'chips';
}

const { items, variant } = Astro.props;

const navClass =
  variant === 'chips'
    ? 'border-b border-border-subtle bg-surface-canvas/90 backdrop-blur supports-[backdrop-filter]:bg-surface-canvas/70'
    : '';

const listClass =
  variant === 'chips'
    ? 'flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
    : 'flex flex-col gap-1';
---

<nav
  class:list={['portfolio-case-study-nav', navClass]}
  data-case-study-nav={variant}
  aria-label="ケーススタディ"
>
  <ul class:list={[listClass]}>
    {
      items.map((item) => (
        <li class:list={[variant === 'chips' && 'shrink-0']}>
          <a
            class="inline-flex max-w-full rounded-md px-3 py-2 text-sm font-medium text-fg-muted underline-offset-4 transition-colors hover:bg-surface-ui hover:text-fg-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            href={`#${item.anchorId}`}
            data-case-anchor={item.anchorId}
          >
            <span class="line-clamp-2">{item.label}</span>
          </a>
        </li>
      ))
    }
  </ul>
</nav>

<script>
  let observer: IntersectionObserver | null = null;

  function setActiveAnchor(activeId: string | null) {
    const links = document.querySelectorAll<HTMLAnchorElement>('a[data-case-anchor]');
    for (const link of links) {
      const id = link.dataset.caseAnchor;
      const isActive = Boolean(activeId && id === activeId);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
      link.classList.toggle('bg-surface-ui-active', isActive);
      link.classList.toggle('text-fg-strong', isActive);
    }
  }

  function initCaseStudyNavHighlight() {
    if (observer) observer.disconnect();

    const sampleLink = document.querySelector<HTMLAnchorElement>('a[data-case-anchor]');
    if (!sampleLink) return;

    const ids = [
      ...new Set(
        [...document.querySelectorAll<HTMLAnchorElement>('a[data-case-anchor]')].map(
          (a) => a.dataset.caseAnchor ?? '',
        ),
      ),
    ].filter(Boolean);

    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length) return;

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const first = visible[0]?.target.id ?? ids[0];
        setActiveAnchor(first);
      },
      {
        root: null,
        rootMargin: '-22% 0px -40% 0px',
        threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
      },
    );

    for (const section of sections) observer.observe(section);
    setActiveAnchor(ids[0]);
  }

  document.addEventListener('astro:page-load', initCaseStudyNavHighlight);
</script>
```

- [ ] **Step 2: 検証**

```bash
bun run check
```

期待: 新規ファイル単体では他ファイル未参照でも通るはず。通らなければ `tsconfig` / Astro の script チェックに従い修正。

- [ ] **Step 3: コミット**

```bash
git add src/components/portfolio/PortfolioCaseStudyNav.astro
git commit -m "feat(portfolio): add persistent case study nav component"
```

---

### Task 3: `PortfolioCaseStudy.astro` をセクション化しリンク構造を変更

**Files:**

- Modify: `src/components/portfolio/PortfolioCaseStudy.astro`

- [ ] **Step 1: `Props` に `sectionId: string` を追加**し、`const { ..., sectionId } = Astro.props` で受け取る。

- [ ] **Step 2: ルート要素を `<article id={sectionId} class:list={[...]}>` に変更**（既存の `relative min-w-0` と `L.grid` は維持）。

- [ ] **Step 3: 既存の「カード全体を包む `<a>`」パターンを廃止**し、次の構造に置換する（`href` が無い分岐は従来どおり `<div>` ベースでよい。`href` があるときだけ画像と CTA をリンク化）。

方針:

- **タイトル `<h3>`** と **説明 `<p>`** は **リンクで包まない**（クリック領域の混乱を避ける）。
- **画像ブロック**を `<a class="group/hero block ..." href={href} aria-label={caseStudyAriaLabel}>` で包み、内側の `<img>` に既存の `linkedImageTransitionAttrs` をそのまま渡す。
- 画像の直下（まだ `href` がある場合）に **テキストリンク**を置く:

```astro
<a
  class="inline-flex items-center gap-1 text-sm font-semibold text-accent underline-offset-4 hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
  href={href}
>
  {linkLabel ?? '詳細を見る'}
  <span class="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
</a>
```

- `href` が無い場合は画像に `alt={imageAlt}` を付け、`transitionName` は渡さない（現状どおり）。

- [ ] **Step 4: 見出しまわりに `scroll-mt-24 md:scroll-mt-32` などを付与**し、アンカージャンプ時に sticky ナビに見出しが隠れにくくする（値は実装時に 1 段階調整してよい）。

- [ ] **Step 5: 検証**

```bash
bun run check
bun run build
```

期待: 型エラーなし、ビルド成功。

- [ ] **Step 6: コミット**

```bash
git add src/components/portfolio/PortfolioCaseStudy.astro
git commit -m "feat(portfolio): anchor sections and split case study links"
```

---

### Task 4: `index.astro` のレイアウトとデータ配線

**Files:**

- Modify: `src/pages/portfolio/index.astro`

- [ ] **Step 1: インポート追加**

```astro
import PortfolioCaseStudyNav from '../../components/portfolio/PortfolioCaseStudyNav.astro';
import type { CaseStudyNavItem } from '../../components/portfolio/portfolio-types';
```

- [ ] **Step 2: `caseStudies` 配列を組み立てる `map` 内で `sectionId: \`case-${entry.id}\`` を返す**（他フィールドは現状維持）。

- [ ] **Step 3: `navItems` を定義**

```typescript
const navItems: CaseStudyNavItem[] = sorted.map((entry) => ({
  anchorId: `case-${entry.id}`,
  label: entry.data.title,
}));
```

- [ ] **Step 4: `#work` セクションのマークアップを置換**（クラス名は微調整可だが、構造は維持）

```astro
<section id="work" class="relative scroll-mt-28" aria-labelledby="work-heading">
  <h2 id="work-heading" class="sr-only">ケーススタディ</h2>

  <div class="md:hidden">
    <div class="sticky top-0 z-20 -mx-6 px-6 pt-2 pb-3 md:static">
      <PortfolioCaseStudyNav variant="chips" items={navItems} />
    </div>
  </div>

  <div class="grid min-w-0 grid-cols-1 gap-10 md:grid-cols-12 md:gap-16 lg:gap-20">
    <aside class="relative hidden min-w-0 md:col-span-3 md:block">
      <div class="sticky top-28">
        <PortfolioCaseStudyNav variant="rail" items={navItems} />
      </div>
    </aside>

    <div class="min-w-0 md:col-span-9">
      <div class="flex min-w-0 flex-col gap-y-24 md:gap-y-40">
        {caseStudies.map((study) => (
          <PortfolioCaseStudy {...study} />
        ))}
      </div>
    </div>
  </div>
</section>
```

注意: `main` の `px-6` とナビの `-mx-6` はチップが画面端まで伸びるための相殺。プロジェクトのパディングが変わっていたら **同じ値に揃える**。

- [ ] **Step 5: 検証**

```bash
bun run check
bun run build
```

- [ ] **Step 6: 手動ブラウザ確認（チェックリスト）**

1. `/portfolio` を開き、ナビの各項目で **対応セクションへスクロール**すること。
2. スクロールしながら **アクティブ項目のハイライト**が大きく破綻していないこと（必要なら `rootMargin` を Task 2 のスクリプトで調整）。
3. **画像または「詳細を見る」**から `/portfolio/work/<slug>` に遷移し、**View Transition** が従来どおり効くこと。
4. `prefers-reduced-motion: reduce` で **致命的なちらつきがない**こと。

- [ ] **Step 7: コミット**

```bash
git add src/pages/portfolio/index.astro
git commit -m "feat(portfolio): two-column shell with persistent case nav"
```

---

### Task 5（任意）: Stitch ダミーコピーへの置換

**Files:**

- Modify: `src/content/case-studies/ether-store.md`
- Modify: `src/content/case-studies/nexus-data.md`
- Modify: `src/content/case-studies/linear-studio.md`
- Modify: `src/content/case-studies/vera-finance.md`
- Modify: `src/pages/portfolio/index.astro`（`PortfolioHero` の props 文案）

- [ ] **Step 1:** Stitch からエクスポートした **見出し・リード・タグ**に合わせて各 Markdown の `title` / `description` / `tags` を編集する（本文はそのままでもよい）。

- [ ] **Step 2:** ヒーロー3行を Stitch の日本語ダミーに合わせて `PortfolioHero` に渡す。

- [ ] **Step 3:** `bun run check` と `bun run build`。

- [ ] **Step 4:** コミット例: `chore(portfolio): align case study copy with Stitch dummy`

---

## Spec coverage（自己チェック）

| Spec 節 | 対応タスク |
|---------|------------|
| §1 ゴール（2 カラム・ナビ・トークン色・コピー B・アンカー主） | Task 2–5 |
| §3 IA / アンカー id | Task 3–4 |
| §4 ナビ挙動・Observer・フォールバック | Task 2（`aria-current` のみでもリンクは機能） |
| §5 レスポンシブ | Task 4（`chips` / `rail`） |
| §6 a11y `nav` + ラベル | Task 2 |
| §7 コンテンツ B | Task 5（任意） |
| §8 テスト | 各タスクの `check` / `build` + Task 4 手動 |

**ギャップなし**（§2 の curl 制約は実装対象外）。

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-12-portfolio-persistent-case-study-nav-plan.md`. Two execution options:**

**1. Subagent-Driven（推奨）** — タスクごとに新しいサブエージェントを回し、タスク間でレビューしながら進める。

**2. Inline Execution** — このセッションで `executing-plans` に沿い、チェックポイントを挟みながらまとめて実装する。

**どちらで進めますか？**
