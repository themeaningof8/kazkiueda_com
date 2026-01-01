import pino from "pino";

/**
 * pinoロガーの設定
 * - 本番環境: JSON出力（Vercel Logsで自動パース）
 * - 開発環境: pino-prettyで読みやすいフォーマット
 *
 * @note process.envを直接使用して循環依存を回避
 * env.tsがlogger.tsをインポートするため、logger.tsではenv.tsをインポートしない
 */
export const logger = pino({
  level:
    (process.env.LOG_LEVEL as pino.Level | undefined) ??
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  transport:
    process.env.NODE_ENV === "production"
      ? undefined // 本番: JSON出力
      : {
          // 開発: pretty print
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss.l",
            ignore: "pid,hostname",
          },
        },
});

/**
 * コンテキスト別の子ロガー
 * 各モジュールで使用するロガーをエクスポート
 */
export const actionLogger = logger.child({ context: "ServerAction" });
export const envLogger = logger.child({ context: "Environment" });
export const payloadLogger = logger.child({ context: "Payload" });
export const renderLogger = logger.child({ context: "Render" });
