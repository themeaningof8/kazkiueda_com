/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** ポートフォリオの連絡先メール（未設定時はページ側のフォールバック） */
  readonly PUBLIC_CONTACT_EMAIL?: string;
  readonly PUBLIC_INSTAGRAM_URL?: string;
  readonly PUBLIC_LINKEDIN_URL?: string;
  readonly PUBLIC_DRIBBBLE_URL?: string;
}

/** Cloudflare Worker / Pages の bindings（wrangler・adapter と一致させる） */
interface Env {
  ASSETS: Fetcher;
  /** `/portfolio` の Basic 認証パスワード（本番は wrangler secret） */
  PREVIEW_SECRET?: string;
}

declare module 'cloudflare:workers' {
  export const env: Env;
}
