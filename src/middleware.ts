import type { MiddlewareHandler } from 'astro';

/**
 * 共有パスワード検証などはここに追加予定。
 * 現時点ではそのまま通過。
 */
export const onRequest: MiddlewareHandler = async (_context, next) => {
  return next();
};
