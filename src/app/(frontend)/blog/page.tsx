import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { PostCard } from "@/components/post-card";
import { ErrorPage } from "@/components/error-page";
import { PageLoading } from "@/components/loading";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BLOG_CONFIG } from "@/lib/constants";
import { getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "ブログ | 記事一覧",
  description: "ブログ記事の一覧ページです。",
};

// ISR: 1時間ごとに再検証
export const revalidate = BLOG_CONFIG.ISR_REVALIDATE_SECONDS;

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

/**
 * ページネーションに表示するページ番号を生成する
 * 現在のページの前後PAGINATION_WINDOWページと、最初・最後のページを表示
 */
function generatePaginationItems(currentPage: number, totalPages: number) {
  const items: (number | "ellipsis-left" | "ellipsis-right")[] = [];
  const window = BLOG_CONFIG.PAGINATION_WINDOW;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - window && i <= currentPage + window)) {
      items.push(i);
    } else if (i === currentPage - window - 1 || i === currentPage + window + 1) {
      items.push(i < currentPage ? "ellipsis-left" : "ellipsis-right");
    }
  }

  return items;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page = "1" } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;

  const { isEnabled } = await draftMode();

  return (
    <Suspense fallback={<PageLoading message="記事を読み込み中..." />}>
      <BlogContent
        page={currentPage}
        draft={isEnabled}
        overrideAccess={isEnabled}
      />
    </Suspense>
  );
}

async function BlogContent({
  page,
  draft,
  overrideAccess
}: {
  page: number;
  draft: boolean;
  overrideAccess: boolean;
}) {
  const result = await getPosts(page, BLOG_CONFIG.POSTS_PER_PAGE, {
    draft,
    overrideAccess,
  });

  if (!result.success) {
    // エラーの種類に応じて適切なエラーページを表示
    const errorType = result.error === "DB_ERROR" ? "server" :
                     result.error === "NETWORK_ERROR" ? "network" :
                     result.error === "TIMEOUT" ? "timeout" : "unknown";

    return <ErrorPage error={{ type: errorType }} />;
  }

  const { posts, totalPages } = result.data;
  const paginationItems = generatePaginationItems(page, totalPages);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <header className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">ブログ</h1>
        <p className="text-lg text-muted-foreground" id="blog-description">記事一覧</p>
      </header>

      {draft && (
        <div className="mb-4 rounded-md bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          プレビューモード - 下書きを含めて表示中
        </div>
      )}

      {posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">まだ記事がありません。</p>
        </div>
      ) : (
        <>
          <div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            role="main"
            aria-labelledby="blog-description"
          >
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-12">
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious href={`/blog?page=${page - 1}`} />
                  </PaginationItem>
                )}

                {paginationItems.map((item) =>
                  item === "ellipsis-left" || item === "ellipsis-right" ? (
                    <PaginationItem key={item}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink asChild isActive={item === page}>
                        <Link href={`/blog?page=${item}`}>{item}</Link>
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext href={`/blog?page=${page + 1}`} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
