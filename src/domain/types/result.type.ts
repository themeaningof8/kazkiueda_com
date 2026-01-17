/**
 * Result Type - 成功/失敗を表現する型
 *
 * Railway Oriented Programmingの概念に基づく
 * エラーハンドリングを型安全にする
 */

/**
 * 成功結果
 */
export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

/**
 * 失敗結果
 */
export interface Failure<E = Error> {
  readonly success: false;
  readonly error: E;
}

/**
 * Result型: 成功または失敗
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Result型のヘルパー関数
 */
export const Result = {
  /**
   * 成功結果を作成
   */
  ok<T>(data: T): Success<T> {
    return { success: true, data };
  },

  /**
   * 失敗結果を作成
   */
  fail<E = Error>(error: E): Failure<E> {
    return { success: false, error };
  },

  /**
   * 成功かどうかを判定（型ガード）
   */
  isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
    return result.success === true;
  },

  /**
   * 失敗かどうかを判定（型ガード）
   */
  isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
    return result.success === false;
  },

  /**
   * Resultの値を変換（map）
   */
  map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
    if (Result.isSuccess(result)) {
      return Result.ok(fn(result.data));
    }
    return result;
  },

  /**
   * Resultのエラーを変換（mapError）
   */
  mapError<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
    if (Result.isFailure(result)) {
      return Result.fail(fn(result.error));
    }
    return result;
  },

  /**
   * Resultをチェーン（flatMap/bind）
   */
  flatMap<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
    if (Result.isSuccess(result)) {
      return fn(result.data);
    }
    return result;
  },

  /**
   * 複数のResultを結合
   * すべて成功の場合のみ成功を返す
   */
  combine<T, E>(results: Array<Result<T, E>>): Result<T[], E> {
    const values: T[] = [];

    for (const result of results) {
      if (Result.isFailure(result)) {
        return result;
      }
      values.push(result.data);
    }

    return Result.ok(values);
  },

  /**
   * デフォルト値を持つ安全な値取得
   */
  getOrElse<T, E>(result: Result<T, E>, defaultValue: T): T {
    return Result.isSuccess(result) ? result.data : defaultValue;
  },

  /**
   * 例外をキャッチしてResultに変換
   */
  tryCatch<T>(fn: () => T): Result<T, Error> {
    try {
      return Result.ok(fn());
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * 非同期関数をResultに変換
   */
  async tryAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
    try {
      const data = await fn();
      return Result.ok(data);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  },
};
