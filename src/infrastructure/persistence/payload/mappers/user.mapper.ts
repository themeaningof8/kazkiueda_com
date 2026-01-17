/**
 * User Mapper - Payload型とドメインエンティティ間の変換
 */

import { User, type UserRole } from "@/domain/entities/user.entity";
import type { User as PayloadUser } from "@/payload-types";

/**
 * Payload User型からドメインUserエンティティに変換
 */
export class UserMapper {
  /**
   * PayloadのUser型をドメインのUserエンティティに変換
   */
  static toDomain(payloadUser: PayloadUser): User {
    return User.reconstruct({
      id: payloadUser.id,
      email: payloadUser.email,
      name: payloadUser.name || undefined,
      role: payloadUser.role as UserRole,
      createdAt: new Date(payloadUser.createdAt),
      updatedAt: new Date(payloadUser.updatedAt),
    });
  }

  /**
   * ドメインのUserエンティティをPayloadのUser型に変換
   * (作成・更新時に使用)
   */
  static toPayload(user: User): Partial<PayloadUser> {
    return {
      email: user.email,
      name: user.name || null,
      role: user.role,
    };
  }

  /**
   * 複数のPayload User型をドメインエンティティの配列に変換
   */
  static toDomainList(payloadUsers: PayloadUser[]): User[] {
    return payloadUsers.map((u) => UserMapper.toDomain(u));
  }
}
