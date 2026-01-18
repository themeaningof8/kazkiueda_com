import type { Where } from "payload";
import type { UserRepository } from "@/domain/repositories/user-repository";
import type { PayloadClient } from "@/lib/api/types";
import type { FetchResult } from "@/lib/types";
import type { User } from "@/payload-types";

/**
 * ユーザーを単一条件で検索するヘルパー関数
 */
async function findUserByCondition(
  payloadClient: PayloadClient,
  where: Where,
): Promise<FetchResult<User>> {
  try {
    const result = await payloadClient.findPayload({
      collection: "users",
      where,
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
}

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
      return findUserByCondition(payloadClient, { id: { equals: id } });
    },

    async findByEmail(email) {
      return findUserByCondition(payloadClient, { email: { equals: email } });
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
