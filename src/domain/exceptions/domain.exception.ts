/**
 * Domain Exception - ドメイン層の基底例外クラス
 *
 * すべてのドメイン例外はこのクラスを継承する
 */

export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // スタックトレースを適切に設定
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * ビジネスルール違反の例外
 */
export class BusinessRuleViolationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

/**
 * バリデーションエラー
 */
export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

/**
 * エンティティが見つからない例外
 */
export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, identifier: string | number) {
    super(`${entityName}が見つかりません: ${identifier}`);
  }
}

/**
 * 重複エラー
 */
export class DuplicateException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
