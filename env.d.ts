/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** ポートフォリオの連絡先メール（未設定時はページ側のフォールバック） */
  readonly PUBLIC_CONTACT_EMAIL?: string;
  readonly PUBLIC_INSTAGRAM_URL?: string;
  readonly PUBLIC_LINKEDIN_URL?: string;
  readonly PUBLIC_DRIBBBLE_URL?: string;
}
