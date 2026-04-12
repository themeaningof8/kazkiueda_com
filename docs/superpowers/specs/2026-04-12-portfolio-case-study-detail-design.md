# Portfolio case study detail pages — design spec

**Status:** Approved in brainstorming (2026-04-12).  
**Scope:** Case study listing → detail navigation, Markdown + frontmatter via Astro Content Collections (Zod), main image View Transitions (`transition:name`), Japanese content and `lang="ja"`.

## 1. Goals

- From `/portfolio`, each case study card links to **`/portfolio/work/[slug]`** with a dedicated detail page.
- **Single source of truth:** listing cards and detail pages read the same collection entries.
- **Body authoring:** plain Markdown (not MDX). Rich structure (tables, blockquotes, headings, lists, external links) as in the reference case study.
- **Images:** hero / card image files live under **`src/assets/`**, referenced from frontmatter using Astro’s **`image()`** helper.
- **Motion:** View Transitions API enabled on portfolio layout; **shared element transition on the main image** between listing and detail (`transition:name`).
- **Language:** Japanese for case study titles, summaries, and body. **`PortfolioHero` copy will move to Japanese** over time; **`html lang="ja"`** for portfolio pages (no per-block `lang="en"` once hero is migrated).

## 2. Non-goals

- MDX or embedded Astro components inside case study bodies (this iteration).
- Valibot for collection schemas: **Astro Content Collections require Zod** via `astro/zod`; no parallel Valibot schema for the same layer.
- Public SEO for case studies: site remains **`noindex, nofollow, noarchive`** per existing layout.
- CMS or remote Markdown sources.

## 3. Routing and files

| Item | Decision |
|------|----------|
| Detail URL | `/portfolio/work/[slug]` |
| Slug source | **Filename stem** of the entry (e.g. `design-system.md` → `design-system`). No duplicate `slug` field in frontmatter unless later needed for redirects. |
| Collection files | e.g. `src/content/case-studies/*.md` (exact folder name fixed at implementation time). |
| Config | `src/content.config.ts` (or Astro-supported equivalent) registering one collection, e.g. `caseStudies`. |
| Detail route | `src/pages/portfolio/work/[slug].astro` with `getStaticPaths` derived from the collection. |
| Listing | `src/pages/portfolio/index.astro` loads the collection, sorts by `order`, maps to existing `PortfolioCaseStudy` props including `href` / `linkLabel` as needed. |

## 4. Frontmatter (Zod) vs Markdown body

**Frontmatter (validated with `astro/zod`):**

| Field | Type | Purpose |
|-------|------|---------|
| `title` | `string` | Canonical page title; **only `<h1>`** on the detail page (hero). |
| `description` | `string` | Card blurb; optional reuse under hero on detail (implementation choice; if unused, keep for listing only). |
| `tags` | `string[]` | Passed to `PortfolioTag`. |
| `order` | `number` | Stable sort order on the listing (ascending rule fixed in implementation, e.g. lower first). |
| `preset` | `'01' \| '02' \| '03' \| '04'` | Existing card layout variant. |
| `heroImage` | `image()` | Local asset reference. |
| `heroAlt` | `string` | Meaningful alt text for the hero image (honest when abstract or confidentiality-limited). |
| `linkLabel` | `string` (optional) | Overrides generated `aria-label` on the listing card link when needed. |

**Markdown body:**

- Does **not** repeat the main title as `# ...` (no second document `<h1>`).
- **Section headings in Markdown use `##` and deeper only** (e.g. `## Context`), because the lone `<h1>` is the hero title from frontmatter.
- Tables, blockquotes, lists, bold, links, horizontal rules — all in Markdown as authored.

## 5. Layout and rendering

- **Layout:** Reuse `PortfolioLayout` for listing and detail. **`ViewTransitions`** from `astro:transitions` added **once** in layout `<head>`.
- **Detail structure:** `<main id="main-content">` → hero (image + `<h1>` + tags [+ optional description]) → `<article>` wrapping rendered Markdown.
- **Render pipeline:** `await entry.render()` and render returned **`Content`** in the article region.
- **Typography:** Either add **`@tailwindcss/typography`** (`prose`) or replicate portfolio body utilities to match About / existing rhythm; pick one during implementation for visual consistency.

## 6. View Transitions and accessibility

- **`transition:name`:** stable per entry, e.g. **`case-hero-<id>`** where `<id>` matches the collection entry id (filename stem). **Same string** on the listing card image and the detail hero image.
- **Listing card:** When the card is a link, the inner image may stay decorative if the **link `aria-label`** (and optional `linkLabel`) carries the accessible name; do not regress keyboard / SR behavior.
- **`prefers-reduced-motion: reduce`:** shorten or zero effective transition duration for root and named image transitions.
- **Visual quality:** listing images use **preset-dependent aspect ratios**; align detail hero framing (**`object-cover`**, matching aspect family per `preset`, or documented trade-off) to reduce jarring morphs.

## 7. Prerender, errors, robots

| Route | `prerender` |
|-------|-------------|
| `/portfolio` | **`false`** (unchanged; session / gate assumptions). |
| `/portfolio/work/[slug]` | **Static generation** at build (`getStaticPaths`; default prerender behavior for these routes). |

- **Unknown slug:** rely on Astro / project **404** handling (custom `404.astro` if present).
- **Robots:** inherit existing **`<meta name="robots" content="noindex, nofollow, noarchive">`** from `PortfolioLayout`.

## 8. Acceptance criteria

- `bun run check` passes after changes.
- `bun run build` succeeds with at least one sample case study entry.
- Listing cards link to correct `/portfolio/work/<id>` URLs; unknown paths 404.
- Detail page shows hero (`title`, tags, image) and rendered Markdown; **exactly one `<h1>`** (hero).
- Navigating listing → detail runs a **View Transition**; **shared image** uses consistent `transition:name` per entry.
- With **`prefers-reduced-motion: reduce`**, transitions do not impose long motion.

## 9. Migration from current listing

- Replace the large inline `caseStudies` array in `src/pages/portfolio/index.astro` with **`getCollection('caseStudies')`** (name to match config).
- Preserve **`PortfolioCaseStudy`** behavior: when `href` is set, card is a link; pass **`href`** derived from entry id.
- Move per-study image URLs into **`src/assets/case-studies/...`** and frontmatter `heroImage` / `heroAlt`.
- **`PortfolioHero`:** plan copy change to Japanese separately; layout **`lang="ja"`** once copy is ready (or set `lang="ja"` when all visible portfolio chrome is Japanese).

## 10. Dependencies (implementation)

- **`astro/zod`** for collection schema (already part of Astro’s documented stack).
- Optional **`@tailwindcss/typography`** if `prose` is chosen for article bodies.

## 11. Open decisions left to implementation plan (not blocking this spec)

- Exact **`order`** sort direction and tie-breaker.
- Whether **`description`** appears on the detail hero under the title.
- Whether to add a visible **“一覧へ戻る”** link in addition to browser back (YAGNI unless requested).

---

**Next step:** After stakeholder review of this file, use the **writing-plans** skill to produce the implementation plan. No implementation work until that plan exists and is agreed for execution.
