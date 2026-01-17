/**
 * Media Repository Interface
 *
 * メディアのデータアクセスを抽象化
 * インフラ層で実装される
 */

import type { Media } from "../entities/media.entity";

export interface FindMediaOptions {
  tag?: string;
  limit?: number;
}

/**
 * MediaRepository インターフェース
 */
export interface MediaRepository {
  /**
   * IDでメディアを取得
   */
  findById(id: number): Promise<Media | undefined>;

  /**
   * メディア一覧を取得
   */
  findAll(options?: FindMediaOptions): Promise<Media[]>;

  /**
   * タグでメディアを検索
   */
  findByTag(tag: string, options?: { limit?: number }): Promise<Media[]>;

  /**
   * メディアを保存（新規作成または更新）
   */
  save(media: Media): Promise<Media>;

  /**
   * メディアを削除
   */
  delete(id: number): Promise<void>;
}
