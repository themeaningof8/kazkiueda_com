"use server";

import { actionClient } from "@/lib/safe-action";
import {
  getPostBySlugSchema,
  getPostsSchema,
  getPublishedPostSlugsSchema,
} from "@/lib/validators/posts";
import {
  findPostBySlug as findPostBySlugPayload,
  findPosts as findPostsPayload,
  findPublishedPostSlugs as findPublishedPostSlugsPayload,
} from "@/lib/api/payload-client";
import { NotFoundError } from "@/lib/errors";
import type { Post } from "@/payload-types";

/**
 * スラッグから記事を取得するAction
 *
 * Client Componentから使用する場合のServer Actionです。
 * Server Componentから使用する場合は getPostBySlug を使用してください。
 */
export const getPostBySlugAction = actionClient
  .schema(getPostBySlugSchema)
  .action(async ({ parsedInput }) => {
    const result = await findPostBySlugPayload(parsedInput.slug, {
      draft: parsedInput.draft,
      overrideAccess: parsedInput.overrideAccess,
    });

    const post = result.docs[0];

    if (!post) {
      throw new NotFoundError();
    }

    return post;
  });

/**
 * 記事一覧を取得するAction
 *
 * Client Componentから使用する場合のServer Actionです。
 * Server Componentから使用する場合は getPosts を使用してください。
 */
export const getPostsAction = actionClient
  .schema(getPostsSchema)
  .action(async ({ parsedInput }) => {
    const result = await findPostsPayload({
      page: parsedInput.page,
      limit: parsedInput.limit,
      draft: parsedInput.draft,
      overrideAccess: parsedInput.overrideAccess,
    });

    return {
      posts: result.docs,
      totalPages: result.totalPages ?? 0,
      totalDocs: result.totalDocs,
    };
  });

/**
 * 公開記事のスラッグ一覧を取得するAction（SSG用）
 *
 * Client Componentから使用する場合のServer Actionです。
 * Server Componentから使用する場合は getPublishedPostSlugs を使用してください。
 */
export const getPublishedPostSlugsAction = actionClient
  .schema(getPublishedPostSlugsSchema)
  .action(async () => {
    const slugs = await findPublishedPostSlugsPayload();
    return slugs;
  });
