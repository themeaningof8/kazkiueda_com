import type { FetchResult } from "@/lib/types";
import type { User } from "@/payload-types";

/**
 * ユーザーリポジトリのインターフェース
 * ドメイン層が必要とするユーザーデータアクセス操作を定義
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
