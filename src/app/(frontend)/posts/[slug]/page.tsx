import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/article-content";
import { ErrorPage } from "@/components/error-page";
import { renderLogger } from "@/lib/logger";
import { getPostBySlug, getPublishedPostSlugs } from "@/lib/posts";

// ISR: 1時間ごとに再検証
export const revalidate = 3600;

// 動的レンダリング: ビルド時のDB接続を回避
export const dynamic = "force-dynamic";

// Note: generateStaticParams は Vercel のビルド時に DB 接続できないため無効化
// ISR により初回アクセス時に生成され、その後 1 時間キャッシュされる

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const result = await getPostBySlug(slug, {
    draft: isEnabled,
    overrideAccess: isEnabled,
  });

  if (!result.success || !result.data) {
    return {
      title: "記事が見つかりません",
    };
  }

  const post = result.data;

  const images =
    post.featuredImage &&
    typeof post.featuredImage === "object" &&
    typeof post.featuredImage.url === "string"
      ? [
          {
            url: post.featuredImage.url,
            alt: post.featuredImage.alt || post.title,
          },
        ]
      : undefined;

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: "article",
      publishedTime: post.publishedDate || undefined,
      images,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const result = await getPostBySlug(slug, {
    draft: isEnabled,
    overrideAccess: isEnabled,
  });

  if (!result.success) {
    if (result.error === "NOT_FOUND") {
      notFound();
    }

    // エラーの種類に応じて適切なエラーページを表示
    const errorType =
      result.error === "DB_ERROR"
        ? "server"
        : result.error === "NETWORK_ERROR"
          ? "network"
          : result.error === "TIMEOUT"
            ? "timeout"
            : "unknown";

    return <ErrorPage error={{ type: errorType }} />;
  }

  const post = result.data;

  return (
    <div className="relative">
      {isEnabled && (
        <div className="sticky top-0 z-10 bg-yellow-100 px-4 py-2 text-center text-sm font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          プレビューモード - 下書きを表示中
        </div>
      )}
      <ArticleContent post={post} />
    </div>
  );
}
