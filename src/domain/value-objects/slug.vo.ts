/**
 * Slug Value Object
 *
 * URLに使用される識別子
 * - 英数字、ハイフン、アンダースコアのみ許可
 * - 100文字以内
 * - イミュータブル
 */

import { ValidationError, ValidationErrorCode } from "@/domain/errors/validation-error";

const SLUG_PATTERN = /^[a-z0-9_-]+$/;
const SLUG_MAX_LENGTH = 100;

export class Slug {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Slugを作成（バリデーション付き）
   */
  static create(value: string): Slug {
    if (!value || typeof value !== "string") {
      throw new ValidationError(ValidationErrorCode.SLUG_REQUIRED);
    }

    if (!SLUG_PATTERN.test(value)) {
      throw new ValidationError(ValidationErrorCode.SLUG_INVALID_FORMAT);
    }

    if (value.length > SLUG_MAX_LENGTH) {
      throw new ValidationError(ValidationErrorCode.SLUG_TOO_LONG, {
        maxLength: SLUG_MAX_LENGTH,
        actualLength: value.length,
      });
    }

    return new Slug(value);
  }

  /**
   * タイトルからSlugを自動生成
   */
  static fromTitle(title: string): Slug | undefined {
    if (!title) return undefined;

    // Unicode正規化（NFD）でアクセント付き文字を分解
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      // 結合文字（アクセントなど）を除去
      .replace(/[\u0300-\u036f]/g, "")
      // URLセーフでない文字を除去
      .replace(/[^\w\s-]/g, "")
      // 連続する空白をハイフンに変換
      .replace(/\s+/g, "-")
      // 先頭・末尾のハイフンを除去
      .replace(/^-+|-+$/g, "");

    // 有効なスラッグが生成できなかった場合はundefinedを返す
    if (slug.length === 0) {
      return undefined;
    }

    try {
      return Slug.create(slug);
    } catch {
      return undefined;
    }
  }

  /**
   * 文字列値を取得
   */
  toString(): string {
    return this.value;
  }

  /**
   * 値オブジェクトの等価性チェック
   */
  equals(other: Slug): boolean {
    if (!(other instanceof Slug)) {
      return false;
    }
    return this.value === other.value;
  }
}
