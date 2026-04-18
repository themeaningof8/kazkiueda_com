# Review follow-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved spec [`docs/superpowers/specs/2026-04-18-review-followup-design.md`](../specs/2026-04-18-review-followup-design.md): AST-based case-study TOC slugs aligned with `rehype-slug`, remove unused TopNav/Popover code paths, and linear-time related-case numbering—without adding automated tests.

**Architecture:** Parse `entry.body` with `unified` + `remark-parse`, walk `heading` nodes (depth 2–6) in document order, derive plain text via `mdast-util-to-string`, slug with one `github-slugger` instance per document, then rebuild the same parent/child tree as today. Delete components and Starwind popover files that no longer mount; trim `PortfolioLayout` and types; fix `knip.json` and `starwind.config.json`. Optimize `relatedItems` with a precomputed `Map` from entry id to index.

**Tech Stack:** Bun, Astro 6, TypeScript, `github-slugger`, `rehype-slug` (unchanged in `astro.config.mjs`), new direct deps: `unified`, `remark-parse`, `mdast-util-to-string`, `unist-util-visit`.

---

## File map

| Path | Action |
|------|--------|
| `package.json` | Add dependencies for remark pipeline |
| `src/lib/case-study-toc.ts` | Replace line-based parser with mdast walk |
| `src/pages/case-study/[slug].astro` | `relatedItems` + index `Map` |
| `src/layouts/PortfolioLayout.astro` | Remove `topNav` / `PortfolioTopNav` |
| `src/components/portfolio/portfolio-types.ts` | Remove `PortfolioTopNavProps`, `CaseStudyNavItem` |
| `src/components/portfolio/PortfolioTopNav.astro` | **Delete** |
| `src/components/portfolio/PortfolioWorkNavPopover.astro` | **Delete** |
| `src/components/portfolio/PortfolioCaseStudyScrollSpy.astro` | **Delete** |
| `src/components/starwind/popover/*` (7 files) | **Delete** entire directory |
| `src/lib/utils/starwind/positioning.ts` | **Delete** |
| `knip.json` | Remove `ignoreIssues` entries for deleted paths |
| `starwind.config.json` | Remove `popover` from `components` |
| `src/styles/styles.css` | Optional: comment that still says “PortfolioTopNav” (~line 170) |

---

### Task 1: Add remark/unified dependencies

**Files:**

- Modify: `package.json` (via lockfile)

- [ ] **Step 1: Install packages**

Run from repo root:

```bash
bun add unified remark-parse mdast-util-to-string unist-util-visit
```

Expected: `package.json` lists the four packages under `dependencies`; `bun.lock` updates.

- [ ] **Step 2: Commit**

```bash
git add package.json bun.lock
git commit -m "deps: add unified pipeline for case-study TOC extraction"
```

---

### Task 2: Rewrite `tocFromMarkdownHeadings` (mdast)

**Files:**

- Modify: `src/lib/case-study-toc.ts`

**Note:** Spec excludes new test files. Verification is `bun run check` / `bun run build` in Task 5.

- [ ] **Step 1: Replace file contents**

Replace `src/lib/case-study-toc.ts` with:

```typescript
import GithubSlugger from 'github-slugger';
import type { Heading, Root } from 'mdast';
import { toString } from 'mdast-util-to-string';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

/** マークダウン見出し（`##`〜`######`）から組み立てた TOC ノード */
export interface TocNode {
  text: string;
  slug: string;
  children: TocNode[];
}

type HeadingInfo = { depth: number; text: string; slug: string };

/**
 * 本文の mdast から `##`〜`######` を抽出し、`rehype-slug` と同様にプレーン見出しテキストを
 * `github-slugger` で slug 化したツリーを返す。
 * 階層は見出しレベルに従い、h2 をルート、h3 以降は親の子になる。
 */
export function tocFromMarkdownHeadings(body: string): TocNode[] {
  const tree = unified().use(remarkParse).parse(body) as Root;
  const slugger = new GithubSlugger();
  const flat: HeadingInfo[] = [];

  visit(tree, 'heading', (node: Heading) => {
    if (node.depth < 2 || node.depth > 6) return;
    const text = toString(node).trim();
    if (!text) return;
    const slug = slugger.slug(text);
    flat.push({ depth: node.depth, text, slug });
  });

  const roots: TocNode[] = [];
  const stack: { level: number; node: TocNode }[] = [];

  for (const { depth, text, slug } of flat) {
    const node: TocNode = { text, slug, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1].node.children.push(node);
    }

    stack.push({ level: depth, node });
  }

  return roots;
}
```

- [ ] **Step 2: Run typecheck**

Run:

```bash
bun run check
```

Expected: No errors in `case-study-toc.ts`. If `mdast` types are unresolved, add:

```bash
bun add -d @types/mdast
```

(Only if `astro check` reports missing types.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/case-study-toc.ts package.json bun.lock
git commit -m "feat(toc): build outline from mdast for rehype-slug alignment"
```

---

### Task 3: Remove dead portfolio + Starwind popover files

**Files:**

- Delete: `src/components/portfolio/PortfolioTopNav.astro`
- Delete: `src/components/portfolio/PortfolioWorkNavPopover.astro`
- Delete: `src/components/portfolio/PortfolioCaseStudyScrollSpy.astro`
- Delete: `src/components/starwind/popover/Popover.astro`
- Delete: `src/components/starwind/popover/PopoverContent.astro`
- Delete: `src/components/starwind/popover/PopoverDescription.astro`
- Delete: `src/components/starwind/popover/PopoverHeader.astro`
- Delete: `src/components/starwind/popover/PopoverTitle.astro`
- Delete: `src/components/starwind/popover/PopoverTrigger.astro`
- Delete: `src/components/starwind/popover/index.ts`
- Delete: `src/lib/utils/starwind/positioning.ts`

- [ ] **Step 1: Delete files**

Use `git rm` on each path above (or delete and `git add` removals) so Git tracks the deletion.

- [ ] **Step 2: Commit**

```bash
git commit -m "chore: remove unused TopNav, popover, and positioning helper"
```

---

### Task 4: Trim `PortfolioLayout` and `portfolio-types`

**Files:**

- Modify: `src/layouts/PortfolioLayout.astro`
- Modify: `src/components/portfolio/portfolio-types.ts`

- [ ] **Step 1: Edit `portfolio-types.ts`**

Remove the entire `CaseStudyNavItem` interface and the entire `PortfolioTopNavProps` interface (lines that only serve TopNav / popover nav). Ensure remaining exports (`CaseStudy`, `FooterLink`, `CaseStudyDetailHeaderProps`, `PortfolioListingHeaderProps`) are unchanged.

- [ ] **Step 2: Edit `PortfolioLayout.astro`**

1. Remove `import PortfolioTopNav from '...'`.
2. Remove `PortfolioTopNavProps` from the type import from `portfolio-types`.
3. Remove `topNav?: PortfolioTopNavProps` from `Props` and the JSDoc line that references `PortfolioTopNav`.
4. Change destructuring: drop `topNav` from `Astro.props`.
5. Replace the header conditional block so it only chooses between `caseStudyDetailHeader`, `portfolioListingHeader`, or nothing—remove the `topNav && <PortfolioTopNav {...topNav} />` branch entirely. After edit, the logic should be: if `caseStudyDetailHeader` then that header; else if `portfolioListingHeader` then that; else render no header component (no `topNav` fallback).

- [ ] **Step 3: Run check**

```bash
bun run check
```

Expected: Clean. Fix any stray imports referencing removed types.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/PortfolioLayout.astro src/components/portfolio/portfolio-types.ts
git commit -m "refactor(layout): drop unused topNav API from PortfolioLayout"
```

---

### Task 5: Update Knip and Starwind config

**Files:**

- Modify: `knip.json`
- Modify: `starwind.config.json`

- [ ] **Step 1: `knip.json`**

Remove these keys from `ignoreIssues` entirely (do not leave empty objects for deleted paths):

- `src/components/starwind/popover/index.ts`
- `src/lib/utils/starwind/positioning.ts`

If `button` entry remains, keep it as today.

- [ ] **Step 2: `starwind.config.json`**

Remove the object `{ "name": "popover", "version": "1.0.0" }` from the `components` array. The array should only contain `button`.

- [ ] **Step 3: Verify Knip**

Run:

```bash
bun run knip
```

Expected: Exit 0. If Knip reports unused exports only in removed areas, adjust `ignoreIssues` minimally.

- [ ] **Step 4: Commit**

```bash
git add knip.json starwind.config.json
git commit -m "chore: align knip and starwind config after popover removal"
```

---

### Task 6: Optimize `relatedItems` in `[slug].astro`

**Files:**

- Modify: `src/pages/case-study/[slug].astro`

- [ ] **Step 1: After `sortedForNav` is computed, add index map**

Insert:

```typescript
const indexById = new Map(sortedForNav.map((e, i) => [e.id, i]));
```

- [ ] **Step 2: Replace `relatedItems` mapping**

Change from:

```typescript
const relatedItems = sortedForNav
  .filter((e) => e.id !== entry.id)
  .map((e) => ({
    href: `/case-study/${e.id}`,
    title: e.data.title,
    listNumber: String(sortedForNav.findIndex((x) => x.id === e.id) + 1).padStart(2, '0'),
  }));
```

To:

```typescript
const relatedItems = sortedForNav
  .filter((e) => e.id !== entry.id)
  .map((e) => ({
    href: `/case-study/${e.id}`,
    title: e.data.title,
    listNumber: String((indexById.get(e.id) ?? 0) + 1).padStart(2, '0'),
  }));
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/case-study/[slug].astro
git commit -m "perf(case-study): O(n) related case list numbers"
```

---

### Task 7: Optional CSS comment + full build

**Files:**

- Modify (optional): `src/styles/styles.css` — update the comment near portfolio listing padding if it still says “PortfolioTopNav” (search for `PortfolioTopNav`).

- [ ] **Step 1: Build**

Run:

```bash
bun run build
```

Expected: Success, no Astro errors.

- [ ] **Step 2: Manual checks (no automated tests per spec)**

1. Open any case-study detail (e.g. `/case-study/design-system`): left TOC links jump to correct `h2`–`h6` ids; scroll-spy in `CaseStudyDetailTocScrollSpy.astro` still highlights the active section.
2. Listing `/case-study` and `/about` render; headers look correct without TopNav.

- [ ] **Step 3: Final commit (if only CSS comment changed)**

```bash
git add src/styles/styles.css
git commit -m "docs(css): clarify portfolio header padding comment"
```

Skip commit if no comment change.

---

## Spec coverage (self-review)

| Spec section | Task(s) |
|--------------|---------|
| §3 TOC mdast + slug | Task 1–2 |
| §4 Dead code + layout + types | Task 3–4 |
| §4.4 knip / starwind | Task 5 |
| §5 relatedItems O(n) | Task 6 |
| §7 Done = check + build + manual | Task 7 |

**Excluded by spec:** new unit/E2E tests (verification commands substitute where needed).

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-18-review-followup-implementation.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration. REQUIRED SUB-SKILL: `superpowers:subagent-driven-development`.

2. **Inline Execution** — Run tasks in this session with `superpowers:executing-plans`, batch with checkpoints.

**Which approach do you want?**
