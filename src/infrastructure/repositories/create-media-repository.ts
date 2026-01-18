import type { MediaRepository } from "@/domain/repositories/media-repository";
import type { PayloadClient } from "@/lib/api/types";

/**
 * MediaRepositoryファクトリー関数
 * PayloadClientに依存してMediaRepositoryを実装
 *
 * @param payloadClient - 依存するPayloadClient
 * @returns MediaRepository実装
 */
export function createMediaRepository(payloadClient: PayloadClient): MediaRepository {
  return {
    async findById(id) {
      try {
        // 汎用的なfindPayload関数を使用してメディアを取得
        // 将来的にパフォーマンスが問題になれば専用関数findMediaByIdを追加
        const result = await payloadClient.findPayload({
          collection: "media",
          where: { id: { equals: id } },
          limit: 1,
        });

        const media = result.docs[0];
        if (!media) {
          return { success: false, error: "NOT_FOUND" };
        }

        return { success: true, data: media };
      } catch (_error) {
        return { success: false, error: "UNKNOWN" };
      }
    },

    async findAll(page = 1, limit = 10) {
      try {
        const result = await payloadClient.findPayload({
          collection: "media",
          page,
          limit,
        });

        return {
          success: true,
          data: {
            media: result.docs,
            totalPages: result.totalPages ?? 0,
            totalDocs: result.totalDocs,
          },
        };
      } catch (_error) {
        return { success: false, error: "DB_ERROR" };
      }
    },
  };
}
