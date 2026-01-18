import type { FetchResult } from "@/lib/types";
import type { User } from "@/payload-types";

/**
 * ユーザーリポジトリのインターフェース
 * ドメイン層が必要とするユーザーデータアクセス操作を定義
 *
 * Note: 現在はインターフェースのみ定義。
 * 将来的にユーザー管理機能が必要になった際に、
 * src/lib/users.ts で実際に使用する予定。
 */
export type UserRepository = {
  /**
   * IDからユーザーを取得
   */
  findById(id: number | string): Promise<FetchResult<User>>;

  /**
   * メールアドレスからユーザーを取得
   */
  findByEmail(email: string): Promise<FetchResult<User>>;

  /**
   * ユーザー一覧を取得（ページネーション対応）
   */
  findAll(
    page: number,
    limit: number,
  ): Promise<
    FetchResult<{
      users: User[];
      totalPages: number;
      totalDocs: number;
    }>
  >;
};
