# Portfolio — Cloudflare Pages (static) + no Basic auth + crawl controls — design spec

**Status:** Approved (2026-04-13).  
**Decisions locked in brainstorming (2026-04-13):** Hosting path **B** — GitHub Actions builds, `**wrangler pages deploy ./dist`** to Cloudflare Pages (not Cloudflare-only Git build). **Full static** for `/`, `/portfolio` index, and existing prerendered case studies. **Remove** HTTP Basic / `PREVIEW_SECRET` gate for recruiter UX. **Strengthen** crawl/index suppression because **current-employer-related content must not spread outward more than necessary** (no guarantee against malicious bots; target well-behaved crawlers and major search engines).

## 1. Goals

- **Recruiter UX:** No browser Basic-auth dialog; share a normal HTTPS URL only.
- **Hosting:** Production traffic on **Cloudflare Pages**, serving **static** build output from `**dist`**, deployed from **GitHub Actions** via `**wrangler pages deploy`** (aligned with existing `deploy:pages` script pattern; exact CLI flags finalized in implementation plan).
- **Static site:** **No server-side HTML per request** in production. Set `**prerender = true`** on `**/**` and `**/portfolio**` (or project-wide `output: 'static'` with no on-demand routes), consistent with `**/portfolio/work/[slug]**` already using `**getStaticPaths**` + `**prerender = true**`.
- **Crawl / index controls (layered):** Keep and align `**robots.txt`**, HTML `**<meta name="robots">**`, and **HTTP `X-Robots-Tag`** on `**/portfolio/***` so signals stay consistent after auth removal. Consider **additional `User-agent` lines** in `robots.txt` for common AI/crawl bots (exact list in implementation plan); effectiveness varies by bot.
- **Remove request-time portfolio gate:** Delete Basic-auth logic from `**src/middleware.ts`**; do not rely on edge middleware for static-only Pages hosting (avoids “works locally / wrong host only” confusion).
- **Secrets:** Do not set `**PREVIEW_SECRET`** for production Pages; remove unused Worker-only secrets from docs and Cloudflare when obsolete.

## 2. Non-goals

- **Replacing** Basic auth with **Cloudflare Access**, new passwords, or invite-only gates in this iteration.
- **Legal or absolute** guarantee that no scraper or human can ever copy content if the URL is known.
- **Changing** public marketing SEO for the main site beyond what `**robots.txt`** and layout already define for `**/portfolio**`.

## 3. Architecture

### 3.1 Build and deploy

- **CI:** `bun install --frozen-lockfile` → `bun run build` on GitHub Actions (unchanged pattern).
- **Deploy:** Replace `**npx wrangler deploy`** with `**wrangler pages deploy**` targeting the **Pages** project and the `**dist`** directory. Align `**--project-name**` (and `**--branch**` if used) with the real Cloudflare Pages project and production branch policy.
- **Preflight:** Keep authenticated `**wrangler whoami`** (or equivalent) step; rename step comments from “Workers deploy” to **Pages deploy** where misleading.

### 3.2 Wrangler and scripts

- `**wrangler.jsonc`** today targets **Workers** (`main: @astrojs/cloudflare/entrypoints/server`). Production path becomes **Pages + static assets only**; implementation plan chooses one of: simplify config for static/Pages-only, add a **Pages-oriented** wrangler file, or document **CLI-only** Pages deploy with minimal JSON — without leaving two conflicting “production” stories.
- `**package.json`:** Default `**deploy`** script and README should state clearly that **production is Pages** (avoid `deploy` still pointing at Workers after cutover).

### 3.3 Adapter and Astro config

- `**@astrojs/cloudflare`:** Decide in implementation whether to **remove** the adapter for a fully static Node-style build, or **keep** it while ensuring **all routes are prerendered** and output is compatible with `**wrangler pages deploy ./dist`**. Choice driven by `**astro build` output**, `**astro preview`**, and `**wrangler pages dev ./dist**` smoke tests.
- `**session` in `astro.config.mjs`:** Unused in `src` today; remove or keep only if still required after static-only path (prefer **remove** if build stays clean).

### 3.4 Middleware

- **Remove** portfolio Basic-auth and any `**PREVIEW_SECRET`** checks from `**src/middleware.ts**`. If the file becomes empty, **delete** the file and unregister middleware per Astro docs.

### 3.5 Local development

- `**astro dev`** remains primary for authoring.
- Use `**bun run pages:dev**` (or documented equivalent) to validate **post-build** static behavior against `**wrangler pages dev ./dist`**.

## 4. Crawl and index suppression (including current-employer sensitivity)

**Intent:** Minimize exposure via **major search indexes** and **well-behaved crawlers**. URL holders can still read pages; **operational discipline** (where the link is posted) remains important.

**Layers (all consistent for `/portfolio`):**

1. `**public/robots.txt`:** Keep `**Disallow: /portfolio`** for `User-agent: *`. Implementation plan may add **explicit `Disallow: /portfolio`** blocks for selected bots (e.g. `**GPTBot**`, `**Google-Extended**` — final list in plan).
2. **HTML:** Keep `**noindex, nofollow, noarchive`** on `**PortfolioLayout**` (covers list + detail).
3. **HTTP headers (required for this spec, not optional):** Add `**X-Robots-Tag: noindex, nofollow, noarchive`** for `**/portfolio/***` via Cloudflare `**public/_headers**` (or build step that emits the same into `**dist**`). Values must match the `**meta robots**` string.
4. **Sitemaps:** Do **not** include `**/portfolio`** URLs in any sitemap introduced or edited in this work.

**Verification:** On staging or `**pages dev`**, check sample URLs for `**meta**`, `**robots.txt**`, and `**X-Robots-Tag**`. Search Console, if used, can lag when reflecting **de-indexing** after policy tightening.

## 5. CI/CD, dashboard, and documentation

- **GitHub Actions workflow** file named `**deploy-pages.yml`:** Either **rename** to match Pages deployment or add a short comment that production is **Pages**, not Workers-only.
- **Cloudflare dashboard (manual):** Pages project exists; **custom domain** and **production branch** match Actions. After cutover, **decommission or repurpose** the old **Worker** that served the same hostname to avoid **duplicate live sites**.
- **Docs to update:** `README.md`, `AGENTS.md`, `CLAUDE.md`, `.dev.vars.example`, and `**docs/requirements.md`** wherever they describe **Basic auth**, `**PREVIEW_SECRET`**, or “auth-gated HTML robots” — rewrite for **no auth** + **header + meta + robots.txt**.

## 6. Testing, risks, rollback

### 6.1 Testing

- `**bun run check`** passes.
- `**bun run build**` produces a `**dist**` tree suitable for Pages (including `**robots.txt**`, `**_headers**` if used).
- Manual: open `**/**`, `**/portfolio**`, and at least **one** `**/portfolio/work/...`** URL — **no Basic prompt**; robots signals present as specified.

### 6.2 Risks and mitigations


| Risk                                | Mitigation                                                                 |
| ----------------------------------- | -------------------------------------------------------------------------- |
| Wrong `**--project-name`** / branch | Fix in workflow + document project name in README.                         |
| Old Worker still bound to same host | Explicitly disable or redeploy Worker after Pages cutover checklist.       |
| Stale search snippets               | Expect delay; `**noindex**` is not an instant removal API for all engines. |
| URL pasted publicly                 | Operational guidance in §4; technology cannot revoke human sharing.        |


### 6.3 Rollback

- Revert the workflow commit that switched deploy to `**wrangler pages deploy**`, restoring `**wrangler deploy**`, **only if** the previous Worker deployment is still viable and not deleted — document this in the implementation plan execution notes.

## 7. Transition

After this spec is **approved by the author**, use the **writing-plans** skill to produce an implementation plan (file list, ordered tasks, verification commands). **Do not** start implementation before that plan exists if following the superpowers pipeline strictly.