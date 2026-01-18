import type { UserRepository } from "@/domain/repositories/user-repository";
import type { PayloadClient } from "@/lib/api/types";

/**
 * UserRepositoryファクトリー関数
 * PayloadClientに依存してUserRepositoryを実装
 *
 * @param payloadClient - 依存するPayloadClient
 * @returns UserRepository実装
 */
export function createUserRepository(payloadClient: PayloadClient): UserRepository {
  return {
    async findById(id) {
      try {
        // 汎用的なfindPayload関数を使用してユーザーを取得
        // 将来的にパフォーマンスが問題になれば専用関数findUserByIdを追加
        const result = await payloadClient.findPayload({
          collection: "users",
          where: { id: { equals: id } },
          limit: 1,
        });

        const user = result.docs[0];
        if (!user) {
          return { success: false, error: "NOT_FOUND" };
        }

        return { success: true, data: user };
      } catch (_error) {
        return { success: false, error: "UNKNOWN" };
      }
    },

    async findByEmail(email) {
      try {
        const result = await payloadClient.findPayload({
          collection: "users",
          where: { email: { equals: email } },
          limit: 1,
        });

        const user = result.docs[0];
        if (!user) {
          return { success: false, error: "NOT_FOUND" };
        }

        return { success: true, data: user };
      } catch (_error) {
        return { success: false, error: "UNKNOWN" };
      }
    },

    async findAll(page = 1, limit = 10) {
      try {
        const result = await payloadClient.findPayload({
          collection: "users",
          page,
          limit,
        });

        return {
          success: true,
          data: {
            users: result.docs,
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
