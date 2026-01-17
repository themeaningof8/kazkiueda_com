/**
 * PostStatus Value Object
 *
 * 記事の公開状態
 * - draft: 下書き
 * - published: 公開済み
 */

export type PostStatusValue = "draft" | "published";

export class PostStatus {
  private readonly value: PostStatusValue;

  private constructor(value: PostStatusValue) {
    this.value = value;
  }

  /**
   * Draft状態のPostStatusを作成
   */
  static draft(): PostStatus {
    return new PostStatus("draft");
  }

  /**
   * Published状態のPostStatusを作成
   */
  static published(): PostStatus {
    return new PostStatus("published");
  }

  /**
   * 文字列からPostStatusを作成
   */
  static from(value: string): PostStatus {
    if (value !== "draft" && value !== "published") {
      throw new Error(`無効な公開状態です: ${value}`);
    }
    return new PostStatus(value);
  }

  /**
   * 下書きかどうか
   */
  isDraft(): boolean {
    return this.value === "draft";
  }

  /**
   * 公開済みかどうか
   */
  isPublished(): boolean {
    return this.value === "published";
  }

  /**
   * 文字列値を取得
   */
  toString(): PostStatusValue {
    return this.value;
  }

  /**
   * 値オブジェクトの等価性チェック
   */
  equals(other: PostStatus): boolean {
    if (!(other instanceof PostStatus)) {
      return false;
    }
    return this.value === other.value;
  }
}
