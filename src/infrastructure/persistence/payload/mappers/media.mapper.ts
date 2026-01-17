/**
 * Media Mapper - Payload型とドメインエンティティ間の変換
 */

import {
  Media,
  type MediaSize,
  type MediaSizes,
  type MediaTag,
} from "@/domain/entities/media.entity";
import type { Media as PayloadMedia } from "@/payload-types";

/**
 * Payload Media型からドメインMediaエンティティに変換
 */
export class MediaMapper {
  /**
   * PayloadのMedia型をドメインのMediaエンティティに変換
   */
  static toDomain(payloadMedia: PayloadMedia): Media {
    if (!payloadMedia.url || !payloadMedia.filename || !payloadMedia.mimeType) {
      throw new Error(`Invalid media data: missing required fields`);
    }

    // タグの変換
    const tags: MediaTag[] = payloadMedia.tags
      ? payloadMedia.tags
          .filter((t) => t.tag)
          .map((t) => ({
            tag: t.tag as string,
            id: t.id || undefined,
          }))
      : [];

    // サイズ情報の変換
    const sizes: MediaSizes | undefined = payloadMedia.sizes
      ? {
          thumbnail: payloadMedia.sizes.thumbnail
            ? {
                url: payloadMedia.sizes.thumbnail.url || "",
                width: payloadMedia.sizes.thumbnail.width || 0,
                height: payloadMedia.sizes.thumbnail.height || 0,
                mimeType: payloadMedia.sizes.thumbnail.mimeType || "",
                filesize: payloadMedia.sizes.thumbnail.filesize || 0,
                filename: payloadMedia.sizes.thumbnail.filename || "",
              }
            : undefined,
          card: payloadMedia.sizes.card
            ? {
                url: payloadMedia.sizes.card.url || "",
                width: payloadMedia.sizes.card.width || 0,
                height: payloadMedia.sizes.card.height || 0,
                mimeType: payloadMedia.sizes.card.mimeType || "",
                filesize: payloadMedia.sizes.card.filesize || 0,
                filename: payloadMedia.sizes.card.filename || "",
              }
            : undefined,
        }
      : undefined;

    return Media.reconstruct({
      id: payloadMedia.id,
      url: payloadMedia.url,
      filename: payloadMedia.filename,
      mimeType: payloadMedia.mimeType,
      filesize: payloadMedia.filesize || 0,
      width: payloadMedia.width || undefined,
      height: payloadMedia.height || undefined,
      alt: payloadMedia.alt || undefined,
      caption: payloadMedia.caption || undefined,
      credit: payloadMedia.credit || undefined,
      tags,
      thumbnailURL: payloadMedia.thumbnailURL || undefined,
      sizes,
      focalX: payloadMedia.focalX || undefined,
      focalY: payloadMedia.focalY || undefined,
      createdAt: new Date(payloadMedia.createdAt),
      updatedAt: new Date(payloadMedia.updatedAt),
    });
  }

  /**
   * ドメインのMediaエンティティをPayloadのMedia型に変換
   * (更新時に使用)
   */
  static toPayload(media: Media): Partial<PayloadMedia> {
    return {
      alt: media.alt || null,
      caption: media.caption || null,
      credit: media.credit || null,
      tags: media.tags.length > 0 ? media.tags : null,
    };
  }

  /**
   * 複数のPayload Media型をドメインエンティティの配列に変換
   */
  static toDomainList(payloadMediaList: PayloadMedia[]): Media[] {
    return payloadMediaList.map((m) => MediaMapper.toDomain(m));
  }
}
