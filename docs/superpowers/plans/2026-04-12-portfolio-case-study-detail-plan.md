# Portfolio case study detail pages — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/portfolio/work/[slug]` case study detail pages backed by Astro Content Collections (Markdown + Zod), wire listing cards with shared-image View Transitions, and align portfolio language to Japanese per the approved spec.

**Architecture:** One `caseStudies` collection (`src/content/case-studies/*.md`) with `astro/zod` schema including `image()` for local heroes under `src/assets/case-studies/<slug>/`. Listing uses `getCollection` + ascending `order` (ties broken by `id`). Detail route uses `getStaticPaths` + `entry.render()`. `PortfolioLayout` enables `ViewTransitions` once; listing and detail pass the same `transition:name` (`case-hero-<id>`) on hero images. CSS in `portfolio.css` handles root/image transitions and `prefers-reduced-motion`.

**Tech Stack:** Astro 6, `@astrojs/cloudflare`, Tailwind CSS v4 (`@tailwindcss/vite`), `@tailwindcss/typography` (new), `astro/zod`, `astro:content`, `astro:assets` (`getImage`, `<Image>`), View Transitions (`astro:transitions`).

**Verification note:** このリポジトリには Vitest / Playwright がまだないため、自動テストの代わりに各タスク末尾で **`bun run check`** と **`bun run build`** を必須ゲートとする。View Transitions の見た目はブラウザ手動確認（仕様書 §8）。

**Spec reference:** `docs/superpowers/specs/2026-04-12-portfolio-case-study-detail-design.md`

---

## File map（作成・変更の単位）

| Path | 役割 |
|------|------|
| `src/content.config.ts` | `caseStudies` コレクション定義（`glob` + Zod + `image()`） |
| `src/content/case-studies/*.md` | 各ケースの frontmatter + 本文 Markdown（`##` から始まる見出しのみ） |
| `src/assets/case-studies/<slug>/hero.webp`（拡張子は実ファイルに合わせる） | カード／詳細で共有するヒーロー画像 |
| `src/pages/portfolio/work/[slug].astro` | 詳細ページ（`getStaticPaths`、`prerender: true` 明示） |
| `src/pages/portfolio/index.astro` | `getCollection` 化、`href` / `transitionName` / `getImage` 連携。ポートレート用の外部 URL は当面このファイルに残してよい（仕様上ケーススタディ画像のみ assets 必須） |
| `src/layouts/PortfolioLayout.astro` | `<ViewTransitions />`、`lang="ja"` |
| `src/components/portfolio/PortfolioCaseStudy.astro` | 任意 `transitionName` を `<img>` に付与 |
| `src/components/portfolio/portfolio-types.ts` | `CaseStudy` に `transitionName?: string` を追加 |
| `src/styles/portfolio.css` | `@plugin "@tailwindcss/typography"` + `::view-transition-*` + reduced-motion |
| `package.json` | `@tailwindcss/typography` 依存追加 |

---

### Task 1: Content config と依存追加

**Files:**

- Create: `src/content.config.ts`
- Modify: `package.json`

- [ ] **Step 1: 依存追加**

```bash
cd /Users/kazkiueda/Sources/github.com/themeaningof8/kazkiueda_com
bun add @tailwindcss/typography
```

- [ ] **Step 2: `src/content.config.ts` を新規作成**（そのまま保存）

```typescript
import { defineCollection, image } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const caseStudies = defineCollection({
  loader: glob({ base: './src/content/case-studies', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    order: z.number().int(),
    preset: z.enum(['01', '02', '03', '04']),
    heroImage: image(),
    heroAlt: z.string(),
    linkLabel: z.string().optional(),
  }),
});

export const collections = { caseStudies };
```

- [ ] **Step 3: 検証**

```bash
bun run check
```

期待: まだ Markdown が無くても設定ファイル単体ではエラーにならない。コレクション参照エラーが出る場合は Task 2 完了後に再実行。

- [ ] **Step 4: コミット**

```bash
git add package.json bun.lock src/content.config.ts
git commit -m "feat(content): add caseStudies collection config and typography dep"
```

---

### Task 2: 画像ダウンロードと Markdown 4 件の雛形

**Files:**

- Create: `src/assets/case-studies/ether-store/hero.webp`（または `.jpg` — `curl` の `-o` を拡張子に合わせる）
- Create: `src/assets/case-studies/nexus-data/hero.webp`
- Create: `src/assets/case-studies/linear-studio/hero.webp`
- Create: `src/assets/case-studies/vera-finance/hero.webp`
- Create: `src/content/case-studies/ether-store.md`
- Create: `src/content/case-studies/nexus-data.md`
- Create: `src/content/case-studies/linear-studio.md`
- Create: `src/content/case-studies/vera-finance.md`

- [ ] **Step 1: ディレクトリ作成**

```bash
mkdir -p src/assets/case-studies/{ether-store,nexus-data,linear-studio,vera-finance}
mkdir -p src/content/case-studies
```

- [ ] **Step 2: 既存の画像 URL から hero を取得**（`index.astro` の `images` 定数からコピーした URL を使う。以下は 2026-04-12 時点の `src/pages/portfolio/index.astro` に対応）

```bash
curl -fsSL "https://lh3.googleusercontent.com/aida-public/AB6AXuDe8TRkOkNVaT71hM2DUFnlyR9KZhQUC-f_0UT4KeQQA-ds-pXs_0LYUImMa-KJrSrTld2oYS1HyzWH4-ajVkkjXk7c9ypNNy4ooXsskfC0UqPngAd8QNKm5The98q30xDgnziGOTRY-XmG3zdGJtapH8gwiWZ4l74VDN00Tpqxdm5chthuAQpqkX7MJpGojRRRT4zfhfP6KU-88UYkDuy__ytuKwdeA_60zgpDbTXuyGU9lHJnXLAzhLxghHa21nY7SQMsFGpwZfU" -o src/assets/case-studies/ether-store/hero.webp
curl -fsSL "https://lh3.googleusercontent.com/aida-public/AB6AXuDUX9sVoxMzpjhhPi5-0sl6-xMGpTywahAg5WyR-QOHZpY8zt5poTKC-2KlaMl4NSLU0XrMnPiY_I9Ir0tpW9WMQRfx2mbrxnVQ-SUs9kT5G-RdlwF-5LMA7Bs6-Rpi6EeTUotHEbQB_FLB1RMU0OcpI2sgaVur2uKA-KRiThblw8e_7wZDSOc3xqotixnU1dyvbAyPKl3_tPrM-qLfnGnM9FbDYKBdDHzkP2BLH5x7dzBIjGvnHEhIr9rvPPzcemIlZp0CS2OHAFI" -o src/assets/case-studies/nexus-data/hero.webp
curl -fsSL "https://lh3.googleusercontent.com/aida-public/AB6AXuCTygJEVY4OIZUqikHBOgXmYr_QoKgN-qouF7C8zry6QVlDKzeXZMdrzhzd7YRLTZrZhaFTw4szCZR90YUBMWHP7DBsvGvEeS9hOW_Lnqp2YyMBiQMacIh3YFMYM0fnVNimSoB5NVagyJrARNxlia9GZaN8qpzzBzug0MUtDMj5xR88cfw0aCr6vKrr0D1gfxHebXZtwbW6VH2QmddMcYjNvGVFb0ukTsgm1O1IccnH18v3Mu47_zEmFEOPKNAK5ZdyDKSKZjVBF9k" -o src/assets/case-studies/linear-studio/hero.webp
curl -fsSL "https://lh3.googleusercontent.com/aida-public/AB6AXuCuopCTW1NHv0yXeS07P2YWfWKj9LfmwDm8xCICb6DHFTVePTL2NJ-pVt-oqOXBOHUvS_yw4KZLd-QP4DwLJT0rfv3mqikLxOlyCRopX8MgMNH3h_O7Be0FHvlwSoBbYAT9zU0d5gtXxkSOKTb-WG-J2LWvgxjqx_SY4zke7f6iqv1YRFjgTBuzhD8REDhvsMpiK7CsOod4ymCU5qZILGQY_IvoX5JPOrvyw2cXZJw3bwo29qS6_dwgsUU_-udqtDt67PRGg3hmGts" -o src/assets/case-studies/vera-finance/hero.webp
```

> 応答が `image/jpeg` の場合は拡張子を `.jpg` にし、frontmatter の相対パスも合わせる。

- [ ] **Step 3: `ether-store.md` を作成**（本文はプレースホルダ。見出しは `##` のみ）

```markdown
---
title: "Ether Store — 高級ファッション向けの体験設計"
description: "ブティック向けに、ビジュアルストーリーテリングとチェックアウト導線を一体で再設計した案件（プレースホルダ）。"
tags:
  - "Eコマース"
  - "ビジュアルストラテジー"
order: 1
preset: "01"
heroImage: "../../assets/case-studies/ether-store/hero.webp"
heroAlt: "高級ブティックの店内を思わせる、明るい自然光と白い陳列のイメージ（プレースホルダ）"
---

> このページはプレースホルダ本文です。正式なケーススタディは `##` 見出しから追加してください。

## 概要

（本文をここに書く。仕様どおりページ上の `h1` は frontmatter の `title` のみ。）
```

- [ ] **Step 4: 他 3 ファイル** — frontmatter のみ差し替え（`title` / `description` / `tags` / `order` / `preset` / `heroImage` / `heroAlt`）。`order` は `nexus-data: 2`, `linear-studio: 3`, `vera-finance: 4`。`preset` はそれぞれ `02`, `03`, `04`。`heroImage` は

| ファイル | `heroImage` 相対パス |
|----------|----------------------|
| `nexus-data.md` | `../../assets/case-studies/nexus-data/hero.webp` |
| `linear-studio.md` | `../../assets/case-studies/linear-studio/hero.webp` |
| `vera-finance.md` | `../../assets/case-studies/vera-finance/hero.webp` |

`title` / `description` / `tags` / `heroAlt` は日本語で、既存 4 案件の意図に対応する短い文でよい（プレースホルダ可）。

- [ ] **Step 5: 検証**

```bash
bun run check
bun run build
```

期待: まだ一覧・詳細ルートは未接続でも、コレクションと画像パスが正ければビルドが通る。

- [ ] **Step 6: コミット**

```bash
git add src/content/case-studies src/assets/case-studies
git commit -m "feat(content): seed case study markdown and local hero assets"
```

---

### Task 3: 型と `PortfolioCaseStudy` に `transition:name` を足す

**Files:**

- Modify: `src/components/portfolio/portfolio-types.ts`
- Modify: `src/components/portfolio/PortfolioCaseStudy.astro`

- [ ] **Step 1: `CaseStudy` に任意フィールドを追加**（`portfolio-types.ts`）

```typescript
export interface CaseStudy {
  preset: CaseStudyPreset;
  tags: string[];
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  href?: string;
  linkLabel?: string;
  /** View Transitions: 一覧カード画像と詳細ヒーローで一致させる名前 */
  transitionName?: string;
}
```

- [ ] **Step 2: `PortfolioCaseStudy.astro` の `<img>` に属性を付与**（`href` があるリンク内の画像のみ `transition:name` を付ける。属性値は `transitionName` が渡されたときだけ）

```astro
---
// props 解构に追加:
const { preset, tags, title, description, imageSrc, imageAlt, href, linkLabel, transitionName } = Astro.props;
---

<!-- リンク版の <img /> に追加（transitionName が truthy のとき） -->
<img
  class="h-full w-full object-cover opacity-20 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-60 forced-colors:opacity-100 forced-colors:mix-blend-normal"
  src={imageSrc}
  alt=""
  width={L.imgWidth}
  height={L.imgHeight}
  loading="lazy"
  decoding="async"
  transition:name={transitionName}
/>
```

> `transition:name={undefined}` が Astro で問題なら、`transitionName ? transitionName : undefined` ではなく条件付きで属性を出し分ける（実装時に Astro の属性仕様に合わせて調整）。

- [ ] **Step 3: 検証**

```bash
bun run check
```

- [ ] **Step 4: コミット**

```bash
git add src/components/portfolio/portfolio-types.ts src/components/portfolio/PortfolioCaseStudy.astro
git commit -m "feat(portfolio): allow case study card image transition name"
```

---

### Task 4: 詳細ページ `[slug].astro`

**Files:**

- Create: `src/pages/portfolio/work/[slug].astro`

- [ ] **Step 1: ファイルを新規作成**（以下をベースに実装。`getCollection` で `id` を `params.slug` に使う）

```astro
---
import type { GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';
import PortfolioLayout from '../../../layouts/PortfolioLayout.astro';
import PortfolioTag from '../../../components/portfolio/PortfolioTag.astro';

export const prerender = true;

export const getStaticPaths = (async () => {
  const entries = await getCollection('caseStudies');
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}) satisfies GetStaticPaths;

interface Props {
  entry: CollectionEntry<'caseStudies'>;
}

const { entry } = Astro.props;
const { Content } = await entry.render();
const { title, description, tags, preset, heroImage, heroAlt } = entry.data;

const transitionName = `case-hero-${entry.id}`;

/** 一覧カードと同じ解像度に寄せるため、PortfolioCaseStudy の L.imgWidth / L.imgHeight と同じテーブルを使う */
const layoutMeta = {
  '01': { imgWidth: 1920, imgHeight: 1080, aspect: 'aspect-video' },
  '02': { imgWidth: 1080, imgHeight: 1080, aspect: 'aspect-square' },
  '03': { imgWidth: 1200, imgHeight: 1600, aspect: 'aspect-[3/4]' },
  '04': { imgWidth: 1000, imgHeight: 1250, aspect: 'aspect-[4/5]' },
} as const;

const L = layoutMeta[preset];
---

<PortfolioLayout title={`${title} | kazkiueda.com`}>
  <main
    id="main-content"
    class="mx-auto min-w-0 max-w-portfolio px-6 pt-20 pb-32 md:px-12 md:pt-28 md:pb-48"
  >
    <article aria-labelledby="case-title">
      <header class="min-w-0 space-y-6">
        <div class="flex flex-wrap gap-3">
          {tags.map((t) => <PortfolioTag label={t} />)}
        </div>
        <h1 id="case-title" class="max-w-4xl text-4xl font-bold tracking-tight text-fg-strong md:text-6xl">
          {title}
        </h1>
        <p class="max-w-2xl text-lg leading-relaxed text-fg-muted">{description}</p>
        <div
          class:list={[
            'relative w-full max-w-5xl overflow-hidden bg-surface-subtle forced-colors:border forced-colors:border-CanvasText',
            L.aspect,
          ]}
        >
          <Image
            src={heroImage}
            alt={heroAlt}
            width={L.imgWidth}
            height={L.imgHeight}
            class="h-full w-full object-cover opacity-90 mix-blend-multiply grayscale transition-opacity duration-500 forced-colors:opacity-100 forced-colors:mix-blend-normal forced-colors:grayscale-0"
            sizes="(min-width: 768px) 80vw, 100vw"
            transition:name={transitionName}
          />
        </div>
      </header>

      <div
        class="prose prose-neutral prose-lg mt-16 max-w-3xl text-fg-muted prose-headings:text-fg-strong prose-a:text-accent prose-strong:text-fg-strong md:mt-24"
      >
        <Content />
      </div>
    </article>
  </main>
</PortfolioLayout>
```

> 実装時の調整: `Image` の `class` は一覧カードの見え方に合わせてトーンを揃える。`prose` は Task 5 で CSS にプラグインを入れた後に有効化される。

- [ ] **Step 2: 検証**

```bash
bun run check
bun run build
```

- [ ] **Step 3: 手動確認**

ローカルで `bun run dev` または `bun run build && bun run preview` を起動し、`/portfolio/work/ether-store` に直接アクセスしてヒーローと本文が表示されること。

- [ ] **Step 4: コミット**

```bash
git add src/pages/portfolio/work/\[slug\].astro
git commit -m "feat(portfolio): add case study detail route"
```

---

### Task 5: レイアウト・CSS・日本語ヒーロー

**Files:**

- Modify: `src/layouts/PortfolioLayout.astro`
- Modify: `src/styles/portfolio.css`
- Modify: `src/pages/portfolio/index.astro`

- [ ] **Step 1: `PortfolioLayout.astro` の `<html>` を `lang="ja"` にし、`<head>` に View Transitions を追加**

```astro
---
import { ViewTransitions } from 'astro:transitions';
// ...
---

<html class="light" lang="ja">
  <head>
    <!-- 既存 meta / link の直後あたり -->
    <ViewTransitions />
```

- [ ] **Step 2: `portfolio.css` の先頭付近に typography プラグインを追加**（`@import 'tailwindcss';` の直後）

```css
@import 'tailwindcss';
@plugin "@tailwindcss/typography";
```

- [ ] **Step 3: 同ファイル末尾付近に View Transition 用スタイルを追加**

```css
@media (prefers-reduced-motion: no-preference) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 280ms;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

- [ ] **Step 4: `index.astro` を `getCollection` ベースに書き換え**（フロントマター内で）

```typescript
import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';

const rawEntries = await getCollection('caseStudies');
const sorted = [...rawEntries].sort((a, b) => {
  if (a.data.order !== b.data.order) return a.data.order - b.data.order;
  return a.id.localeCompare(b.id);
});

const caseStudies = await Promise.all(
  sorted.map(async (entry) => {
    const { preset, tags, title, description, heroImage, heroAlt, linkLabel } = entry.data;
    const dims =
      preset === '01'
        ? { w: 1920, h: 1080 }
        : preset === '02'
          ? { w: 1080, h: 1080 }
          : preset === '03'
            ? { w: 1200, h: 1600 }
            : { w: 1000, h: 1250 };
    const optimized = await getImage({ src: heroImage, width: dims.w, height: dims.h });
    return {
      preset,
      tags,
      title,
      description,
      imageSrc: optimized.src,
      imageAlt: heroAlt,
      href: `/portfolio/work/${entry.id}`,
      linkLabel,
      transitionName: `case-hero-${entry.id}`,
    } satisfies CaseStudy;
  }),
);
```

> `images` の ether〜vera 定数と `caseStudies` 配列リテラルは削除。`images.portrait` は About 用に **`const portraitSrc = '...'` の 1 行**として残す（URL は現状の Googleusercontent のまま）。

- [ ] **Step 5: `PortfolioHero` の props を日本語に変更**（例）

```astro
<PortfolioHero
  titleLine1="静かな画面に、"
  titleAccent="体験を刻む。"
  lead="リズムと階層、光と余白の関係性を大切にする、テキスト起点のインターフェースデザインです。"
/>
```

- [ ] **Step 6: `PortfolioCaseStudy` に `transitionName` を渡す**（`.map` 内）

```astro
{
  caseStudies.map((study) => <PortfolioCaseStudy {...study} />);
}
```

（`CaseStudy` に `transitionName` が含まれていれば spread で足りる。）

- [ ] **Step 7: 検証**

```bash
bun run check
bun run build
```

- [ ] **Step 8: 手動で View Transition 確認**（`/portfolio` → カードクリック → 詳細で画像 morph。macOS の「視差効果を減らす」ON でアニメが実質無効になること）

- [ ] **Step 9: コミット**

```bash
git add src/layouts/PortfolioLayout.astro src/styles/portfolio.css src/pages/portfolio/index.astro
git commit -m "feat(portfolio): wire collection listing, view transitions, ja hero"
```

---

### Task 6: 仕上げと回帰確認

**Files:**

- Modify: 必要なら `src/pages/portfolio/work/[slug].astro` のヒーロー `Image` の見た目を `PortfolioCaseStudy` に寄せる（`opacity` / `mix-blend` / `grayscale` の一致）

- [ ] **Step 1: 存在しない slug で 404 になることを確認**（例: `/portfolio/work/does-not-exist`）

- [ ] **Step 2: `bun run check` と `bun run build` を再実行**

- [ ] **Step 3: 最終コミット**（調整があればメッセージを変える）

```bash
git add -A
git commit -m "chore(portfolio): polish case study detail and transitions"
```

---

## Plan self-review（対 spec の突合せ）

| Spec 節 | カバーするタスク |
|---------|------------------|
| §3 ルーティング / ファイル | Task 1–2, 4 |
| §4 frontmatter / 本文ルール | Task 2（雛形コメント）、執筆時はレビューで `##` 遵守 |
| §5 レイアウト / `render()` | Task 4–5 |
| §6 View Transitions / a11y | Task 3–5 |
| §7 prerender / 404 / robots | Task 4（`prerender: true`）、404 は Astro デフォルト、robots は既存 Layout |
| §8 受け入れ | 各タスクの `check` / `build`、Task 5–6 の手動 |
| §9 移行 | Task 2 + Task 5 |
| §10 依存 | Task 1 |
| §11 オープン決定 | `order` 昇順 + `id` タイブレーク、`description` を詳細ヒーローに表示、「戻るリンク」は未実装（YAGNI） |

**Placeholder スキャン:** 本プランに `TBD` / 未指定の「あとで」は置いていない。画像拡張子だけ実ファイルに合わせて調整が必要。

---

## Execution handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-12-portfolio-case-study-detail-plan.md`. Two execution options:**

1. **Subagent-Driven（推奨）** — タスクごとに新しいサブエージェントを回し、タスク間でレビューしながら進める  
2. **Inline Execution** — このセッションで `executing-plans` に沿ってまとめて実装し、チェックポイントで止める  

**どちらで進めますか？**
