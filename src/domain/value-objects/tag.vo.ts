/**
 * Tag Value Object
 *
 * 記事やメディアに付与されるタグ
 * - 50文字以内
 * - イミュータブル
 */

const TAG_MAX_LENGTH = 50;

export class Tag {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Tagを作成（バリデーション付き）
   */
  static create(value: string): Tag {
    if (!value || typeof value !== "string") {
      throw new Error("タグは必須です");
    }

    if (value.length > TAG_MAX_LENGTH) {
      throw new Error(`タグは${TAG_MAX_LENGTH}文字以内で入力してください`);
    }

    return new Tag(value);
  }

  /**
   * 文字列値を取得
   */
  toString(): string {
    return this.value;
  }

  /**
   * 正規化されたタグ名を取得（小文字）
   * 重複チェックに使用
   */
  toNormalized(): string {
    return this.value.toLowerCase();
  }

  /**
   * 値オブジェクトの等価性チェック
   */
  equals(other: Tag): boolean {
    if (!(other instanceof Tag)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * 正規化された値で等価性チェック
   * 大文字小文字を区別しない比較
   */
  equalsNormalized(other: Tag): boolean {
    if (!(other instanceof Tag)) {
      return false;
    }
    return this.toNormalized() === other.toNormalized();
  }
}
