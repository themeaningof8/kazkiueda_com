import type { FetchResult } from "@/lib/types";
import type { Media } from "@/payload-types";

/**
 * メディアリポジトリのインターフェース
 * ドメイン層が必要とするメディアデータアクセス操作を定義
 *
 * Note: 現在はインターフェースのみ定義。
 * 将来的にメディア管理機能が必要になった際に、
 * src/lib/media.ts で実際に使用する予定。
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
