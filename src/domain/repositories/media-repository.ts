import type { FetchResult } from "@/lib/types";
import type { Media } from "@/payload-types";

/**
 * メディアリポジトリのインターフェース
 * ドメイン層が必要とするメディアデータアクセス操作を定義
 */
export type MediaRepository = {
  /**
   * IDからメディアを取得
   */
  findById(id: number | string): Promise<FetchResult<Media>>;

  /**
   * メディア一覧を取得（ページネーション対応）
   */
  findAll(
    page: number,
    limit: number,
  ): Promise<
    FetchResult<{
      media: Media[];
      totalPages: number;
      totalDocs: number;
    }>
  >;
};
