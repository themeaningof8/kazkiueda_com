import { ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/format-date";
import type { Post } from "@/payload-types";

interface PostCardProps {
  post: Post;
}

interface TagObject {
  tag: string;
  id?: string | null;
}

// タグオブジェクトの型ガード関数
function isTagObject(item: unknown): item is TagObject {
  return (
    typeof item === "object" &&
    item !== null &&
    "tag" in item &&
    typeof (item as TagObject).tag === "string"
  );
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg">
      {post.featuredImage && typeof post.featuredImage === "object" ? (
        typeof post.featuredImage.url === "string" ? (
          <Link href={`/posts/${post.slug}`}>
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <Image
                src={post.featuredImage.url}
                alt={post.featuredImage.alt || post.title || ""}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </Link>
        ) : (
          <Link href={`/posts/${post.slug}`}>
            <div className="flex aspect-video w-full items-center justify-center overflow-hidden bg-muted">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          </Link>
        )
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex flex-wrap gap-2">
          {post.tags?.map((tagItem) => {
            const tagText = isTagObject(tagItem) ? tagItem.tag : String(tagItem);
            return (
              <span
                key={tagText}
                className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                {tagText}
              </span>
            );
          })}
        </div>
        <h2 className="mb-2 text-xl font-semibold leading-tight">
          <Link
            href={`/posts/${post.slug}`}
            className="transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
          >
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
        )}
        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          {post.publishedDate && (
            <time dateTime={post.publishedDate}>{formatDate(post.publishedDate)}</time>
          )}
          <Link
            href={`/posts/${post.slug}`}
            className="font-medium transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
          >
            続きを読む →
          </Link>
        </div>
      </div>
    </article>
  );
}
