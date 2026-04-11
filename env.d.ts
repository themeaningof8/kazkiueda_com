/// <reference types="astro/client" />

/** Cloudflare Worker / Pages の bindings（wrangler・adapter と一致させる） */
interface Env {
  ASSETS: Fetcher;
  /** `/portfolio` の Basic 認証パスワード（本番は wrangler secret） */
  PREVIEW_SECRET?: string;
}

declare module 'cloudflare:workers' {
  export const env: Env;
}
