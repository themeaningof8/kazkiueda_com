import type { MiddlewareHandler } from 'astro';
import { env } from 'cloudflare:workers';

const PORTFOLIO_PREFIX = '/portfolio';

function unauthorized(): Response {
  return new Response('認証が必要です（ブラウザのダイアログにパスワードを入力してください。ユーザー名は任意です）', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Portfolio preview"',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { pathname } = context.url;
  if (!pathname.startsWith(PORTFOLIO_PREFIX)) {
    return next();
  }

  const secret = (env.PREVIEW_SECRET ?? '').trim();
  // 未設定ならゲートなし（本番の公開ポートフォリオ）。値を入れたときだけ Basic 認証。
  if (!secret) {
    return next();
  }

  const header = context.request.headers.get('Authorization');
  if (!header?.startsWith('Basic ')) {
    return unauthorized();
  }

  let decoded: string;
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return unauthorized();
  }

  const colon = decoded.indexOf(':');
  const password = colon === -1 ? decoded : decoded.slice(colon + 1);

  if (!timingSafeEqualString(password, secret)) {
    return unauthorized();
  }

  return next();
};
