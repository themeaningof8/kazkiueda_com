/**
 * PayloadMediaRepository - MediaRepositoryのPayload CMS実装
 */

import type { Media } from "@/domain/entities/media.entity";
import type { FindMediaOptions, MediaRepository } from "@/domain/repositories/media.repository";
import { findPayload } from "@/lib/api/payload-client";
import { toMediaDomain, toMediaDomainList } from "../mappers/media.mapper";

export class PayloadMediaRepository implements MediaRepository {
  /**
   * IDでメディアを取得
   */
  async findById(id: number): Promise<Media | undefined> {
    const result = await findPayload({
      collection: "media",
      where: {
        id: {
          equals: id,
        },
      },
      limit: 1,
    });

    if (result.docs.length === 0) {
      return undefined;
    }

    return toMediaDomain(result.docs[0]);
  }

  /**
   * メディア一覧を取得
   */
  async findAll(options?: FindMediaOptions): Promise<Media[]> {
    const where = options?.tag
      ? {
          "tags.tag": {
            equals: options.tag,
          },
        }
      : undefined;

    const result = await findPayload({
      collection: "media",
      where,
      limit: options?.limit || 100,
      sort: "-createdAt",
    });

    return toMediaDomainList(result.docs);
  }

  /**
   * タグでメディアを検索
   */
  async findByTag(tag: string, options?: { limit?: number }): Promise<Media[]> {
    return this.findAll({
      tag,
      limit: options?.limit,
    });
  }

  /**
   * メディアを保存（新規作成または更新）
   */
  async save(_media: Media): Promise<Media> {
    // TODO: Phase 3で実装
    throw new Error("Method not implemented: save");
  }

  /**
   * メディアを削除
   */
  async delete(_id: number): Promise<void> {
    // TODO: Phase 3で実装
    throw new Error("Method not implemented: delete");
  }
}
