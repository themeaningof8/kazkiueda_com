/**
 * PostStatus Value Object
 *
 * 記事の公開状態
 * - draft: 下書き
 * - published: 公開済み
 */

import { ValidationError, ValidationErrorCode } from "@/domain/errors/validation-error";

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
      throw new ValidationError(ValidationErrorCode.POST_STATUS_INVALID, {
        value,
        validValues: ["draft", "published"],
      });
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
