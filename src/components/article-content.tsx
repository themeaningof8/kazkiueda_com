import { RichTextRenderer } from "@/components/rich-text";
import { formatDate } from "@/lib/format-date";
import type { Post } from "@/payload-types";

interface ArticleContentProps {
  post: Post;
  isPreview?: boolean;
}

export function ArticleContent({ post, isPreview = false }: ArticleContentProps) {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16">
      <header className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">{post.title}</h1>
        {post.excerpt && <p className="mb-4 text-xl text-muted-foreground">{post.excerpt}</p>}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {post.publishedDate && (
            <time dateTime={post.publishedDate}>{formatDate(post.publishedDate)}</time>
          )}
          {isPreview && (
            <span className="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-800">
              {post._status === "draft" ? "下書き" : "公開"}
            </span>
          )}
        </div>
      </header>

      {post.content && <RichTextRenderer data={post.content} />}
    </article>
  );
}
