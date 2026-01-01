import config from "@payload-config";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { getPayload } from "payload";

// slugの形式を検証（英数字、ハイフン、アンダースコアのみ）
const SLUG_PATTERN = /^[a-z0-9_-]+$/;

/**
 * リダイレクト先パスを検証し、安全な値のみ許可する（Open Redirect対策）
 * - 相対パス（/で始まる）のみ許可
 * - 外部URL（http://、https://、//）を拒否
 * - /posts/ 配下のみ許可（ホワイトリスト）
 */
function validateRedirectPath(path: string | null, slug: string): string | null {
  const targetPath = path || `/posts/${slug}`;

  // 外部URLや不正なパスを拒否
  if (
    targetPath.startsWith("http://") ||
    targetPath.startsWith("https://") ||
    targetPath.startsWith("//")
  ) {
    return null;
  }

  // 相対パス（/で始まる）のみ許可
  if (!targetPath.startsWith("/")) {
    return null;
  }

  // /posts/ 配下のみ許可（このプロジェクトではcollection=postsのみ対応）
  if (!targetPath.startsWith("/posts/")) {
    return null;
  }

  return targetPath;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const previewSecret = searchParams.get("previewSecret");
  const slug = searchParams.get("slug");
  const collection = searchParams.get("collection");
  const path = searchParams.get("path");


  if (!previewSecret || previewSecret !== process.env.PAYLOAD_PREVIEW_SECRET) {
    return new Response("Invalid preview secret", { status: 403 });
  }

  if (!slug || !collection) {
    return new Response("Missing slug or collection", { status: 400 });
  }

  // slugの形式を検証
  if (!SLUG_PATTERN.test(slug)) {
    return new Response("Invalid slug format", { status: 400 });
  }

  if (collection !== "posts") {
    return new Response("Unsupported collection", { status: 400 });
  }

  // リダイレクト先のパスを検証（Open Redirect対策）
  const redirectPath = validateRedirectPath(path, slug);
  if (!redirectPath) {
    return new Response("Invalid redirect path", { status: 400 });
  }

  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });

  if (!user) {
    return new Response("Unauthorized", { status: 403 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(redirectPath);
}
