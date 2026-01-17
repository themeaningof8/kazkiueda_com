/**
 * ブログ設定の定数
 */
export const BLOG_CONFIG = {
  /** 1ページあたりの記事数 */
  POSTS_PER_PAGE: 12,
  /** ISRの再検証間隔（秒） */
  ISR_REVALIDATE_SECONDS: 3600, // 1時間
  /** ページネーション表示範囲（現在のページの前後） */
  PAGINATION_WINDOW: 2,
  /** SSG時のページサイズ */
  PAGINATION_PAGE_SIZE_SSG: 100,
} as const;

/**
 * バリデーション制限の定数
 */
export const VALIDATION_LIMITS = {
  /** スラッグの最大長 */
  SLUG_MAX_LENGTH: 100,
  /** タグの最大長 */
  TAG_MAX_LENGTH: 50,
  /** 抜粋の最大長 */
  EXCERPT_MAX_LENGTH: 500,
} as const;

/**
 * 画像サイズの定数
 */
export const IMAGE_SIZES = {
  /** サムネイル画像サイズ */
  THUMBNAIL: {
    width: 400,
    height: 300,
  },
  /** カード画像サイズ */
  CARD: {
    width: 768,
    height: 1024,
  },
} as const;
