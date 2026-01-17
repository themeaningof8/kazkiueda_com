/**
 * User Repository Interface
 *
 * ユーザーのデータアクセスを抽象化
 * インフラ層で実装される
 */

import type { User, UserRole } from "../entities/user.entity";

/**
 * UserRepository インターフェース
 */
export interface UserRepository {
  /**
   * IDでユーザーを取得
   */
  findById(id: number): Promise<User | undefined>;

  /**
   * メールアドレスでユーザーを取得
   */
  findByEmail(email: string): Promise<User | undefined>;

  /**
   * ユーザー一覧を取得
   */
  findAll(options?: { role?: UserRole; limit?: number }): Promise<User[]>;

  /**
   * ユーザーを保存（新規作成または更新）
   */
  save(user: User): Promise<User>;

  /**
   * ユーザーを削除
   */
  delete(id: number): Promise<void>;

  /**
   * メールアドレスの存在チェック（重複チェック用）
   */
  existsByEmail(email: string): Promise<boolean>;
}
