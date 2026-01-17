/**
 * PayloadPostRepository - PostRepositoryのPayload CMS実装
 *
 * ドメイン層のPostRepositoryインターフェースを実装し、
 * Payload CMSを使用したデータ永続化を提供する
 */

import type { Where } from "payload";
import type { Post } from "@/domain/entities/post.entity";
import type {
  FindPostsOptions,
  FindPostsResult,
  PostRepository,
} from "@/domain/repositories/post.repository";
import { Pagination } from "@/domain/value-objects/pagination.vo";
import type { PostStatus } from "@/domain/value-objects/post-status.vo";
import type { Slug } from "@/domain/value-objects/slug.vo";
import { findPayload } from "@/lib/api/payload-client";
import { buildPublishStatusFilter, buildSlugFilter } from "@/lib/api/payload-filters";
import { BLOG_CONFIG } from "@/lib/constants";
import { PostMapper } from "../mappers/post.mapper";

export class PayloadPostRepository implements PostRepository {
  /**
   * 共通のfindヘルパーメソッド
   */
  private async findSinglePost(where: Where): Promise<Post | undefined> {
    const result = await findPayload({
      collection: "posts",
      where,
      limit: 1,
      populate: {
        featuredImage: true,
        author: true,
      },
    });

    if (result.docs.length === 0) {
      return undefined;
    }

    return PostMapper.toDomain(result.docs[0]);
  }

  /**
   * IDで記事を取得
   */
  async findById(id: number): Promise<Post | undefined> {
    return this.findSinglePost({
      id: {
        equals: id,
      },
    });
  }

  /**
   * Slugで記事を取得
   */
  async findBySlug(slug: Slug): Promise<Post | undefined> {
    const where = buildSlugFilter(slug.toString(), false);
    return this.findSinglePost(where);
  }

  /**
   * 記事一覧を取得（ページネーション対応）
   */
  async findAll(options?: FindPostsOptions): Promise<FindPostsResult> {
    const page = options?.page || 1;
    const limit = options?.limit || BLOG_CONFIG.POSTS_PER_PAGE;

    // ステータスフィルター
    const statusFilter = options?.status
      ? {
          _status: {
            equals: options.status.toString(),
          },
        }
      : buildPublishStatusFilter(false);

    // タグフィルター
    const tagFilter = options?.tag
      ? {
          "tags.tag": {
            equals: options.tag,
          },
        }
      : undefined;

    // フィルターを結合
    const where = tagFilter
      ? {
          and: [statusFilter, tagFilter],
        }
      : statusFilter;

    const result = await findPayload({
      collection: "posts",
      where,
      sort: "-publishedDate",
      limit,
      page,
      populate: {
        featuredImage: true,
        author: true,
      },
    });

    const posts = PostMapper.toDomainList(result.docs);
    const pagination = Pagination.create(page, limit, result.totalDocs);

    return {
      posts,
      pagination,
    };
  }

  /**
   * タグで記事を検索
   */
  async findByTag(tag: string, options?: FindPostsOptions): Promise<FindPostsResult> {
    return this.findAll({
      ...options,
      tag,
    });
  }

  /**
   * すべてのタグを取得
   */
  async findAllTags(): Promise<string[]> {
    // すべての公開済み記事を取得
    const result = await findPayload({
      collection: "posts",
      where: buildPublishStatusFilter(false),
      limit: 1000, // 十分大きな数
      select: {
        slug: false, // tagsのみ必要なので他はfalse
      },
    });

    // すべてのタグを収集して重複を除去
    const tags = new Set<string>();
    for (const post of result.docs) {
      if (post.tags) {
        for (const tagObj of post.tags) {
          tags.add(tagObj.tag);
        }
      }
    }

    return Array.from(tags).sort();
  }

  /**
   * 公開済み記事のスラグ一覧を取得
   */
  async findPublishedSlugs(): Promise<Slug[]> {
    const result = await findPayload({
      collection: "posts",
      where: buildPublishStatusFilter(false),
      limit: 1000,
    });

    const posts = PostMapper.toDomainList(result.docs);
    return posts.map((p) => ({ toString: () => p.slug }) as Slug);
  }

  /**
   * 記事を保存（新規作成または更新）
   */
  async save(post: Post): Promise<Post> {
    // TODO: Phase 3で実装（現在は読み取り専用）
    throw new Error("Method not implemented: save");
  }

  /**
   * 記事を削除
   */
  async delete(id: number): Promise<void> {
    // TODO: Phase 3で実装（現在は読み取り専用）
    throw new Error("Method not implemented: delete");
  }

  /**
   * 総件数を取得
   */
  async count(options?: { status?: PostStatus; tag?: string }): Promise<number> {
    const statusFilter = options?.status
      ? {
          _status: {
            equals: options.status.toString(),
          },
        }
      : buildPublishStatusFilter(false);

    const tagFilter = options?.tag
      ? {
          "tags.tag": {
            equals: options.tag,
          },
        }
      : undefined;

    const where = tagFilter
      ? {
          and: [statusFilter, tagFilter],
        }
      : statusFilter;

    const result = await findPayload({
      collection: "posts",
      where,
      limit: 1,
    });

    return result.totalDocs;
  }
}
