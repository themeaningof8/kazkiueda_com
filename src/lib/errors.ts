/**
 * カスタムエラークラス
 * エラーハンドリングを型安全にする
 */

/**
 * リソースが見つからない場合のエラー
 * Server Actionsでのエラーハンドリングに使用
 */
export class NotFoundError extends Error {
  constructor(message = "NOT_FOUND") {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * データベースエラー
 * 将来的にServer Actionsでより詳細なエラーハンドリングが必要になった場合に使用予定
 */
export class DatabaseError extends Error {
  constructor(message = "DB_ERROR") {
    super(message);
    this.name = "DatabaseError";
  }
}
