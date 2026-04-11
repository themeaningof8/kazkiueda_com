/// <reference types="astro/client" />

/** Cloudflare Pages `ASSETS` binding (see wrangler / adapter). */
interface Env {
  ASSETS: Fetcher;
}
