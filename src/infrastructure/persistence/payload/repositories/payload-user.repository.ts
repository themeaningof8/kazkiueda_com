/**
 * PayloadUserRepository - UserRepositoryのPayload CMS実装
 */

import type { User, UserRole } from "@/domain/entities/user.entity";
import type { UserRepository } from "@/domain/repositories/user.repository";
import { findPayload } from "@/lib/api/payload-client";
import { toUserDomain, toUserDomainList } from "../mappers/user.mapper";

export class PayloadUserRepository implements UserRepository {
  /**
   * IDでユーザーを取得
   */
  async findById(id: number): Promise<User | undefined> {
    const result = await findPayload({
      collection: "users",
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

    return toUserDomain(result.docs[0]);
  }

  /**
   * メールアドレスでユーザーを取得
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const result = await findPayload({
      collection: "users",
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    });

    if (result.docs.length === 0) {
      return undefined;
    }

    return toUserDomain(result.docs[0]);
  }

  /**
   * ユーザー一覧を取得
   */
  async findAll(options?: { role?: UserRole; limit?: number }): Promise<User[]> {
    const where = options?.role
      ? {
          role: {
            equals: options.role,
          },
        }
      : undefined;

    const result = await findPayload({
      collection: "users",
      where,
      limit: options?.limit || 100,
      sort: "-createdAt",
    });

    return toUserDomainList(result.docs);
  }

  /**
   * ユーザーを保存（新規作成または更新）
   */
  async save(_user: User): Promise<User> {
    // TODO: Phase 3で実装
    throw new Error("Method not implemented: save");
  }

  /**
   * ユーザーを削除
   */
  async delete(_id: number): Promise<void> {
    // TODO: Phase 3で実装
    throw new Error("Method not implemented: delete");
  }

  /**
   * メールアドレスの存在チェック
   */
  async existsByEmail(email: string): Promise<boolean> {
    const result = await findPayload({
      collection: "users",
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    });

    return result.docs.length > 0;
  }
}
