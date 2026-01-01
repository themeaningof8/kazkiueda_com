/**
 * エラータイプの定義
 */
export type ErrorType =
  | "NOT_FOUND"        // リソースが見つからない
  | "DB_ERROR"         // データベース接続/操作エラー
  | "NETWORK_ERROR"    // ネットワーク接続エラー
  | "TIMEOUT"          // リクエストタイムアウト
  | "CORS_ERROR"       // CORSポリシー違反
  | "INVALID_RESPONSE" // レスポンス形式が無効
  | "SERVER_ERROR"     // サーバー内部エラー (5xx)
  | "UNKNOWN";         // その他の予期しないエラー

/**
 * データ取得結果の型
 * 成功時とエラー時を明確に区別する
 */
export type FetchResult<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorType };

/**
 * Payload APIの検索結果型
 *
 * PayloadのPaginatedDocsから実際に使用するフィールドのみを抽出した型です。
 * ページネーション情報（page、prevPage、nextPage、pagingCounterなど）は
 * 現在の実装では使用していないため、含めていません。
 */
export type PayloadFindResult<T> = {
  /** 検索結果のドキュメント配列 */
  docs: T[];
  /** 総ドキュメント数 */
  totalDocs: number;
  /** 総ページ数（ページネーション時のみ） */
  totalPages?: number;
  /** 次のページが存在するか（ページネーション時のみ） */
  hasNextPage?: boolean;
  /** 前のページが存在するか（ページネーション時のみ） */
  hasPrevPage?: boolean;
};
