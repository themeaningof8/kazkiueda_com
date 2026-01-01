import { createSafeActionClient } from "next-safe-action";
import { env } from "@/lib/env";
import { actionLogger } from "@/lib/logger";
import { NotFoundError } from "./errors";

/**
 * Server Actionsの基底クライアント
 * - Valibotスキーマによる入力検証（Standard Schema v1経由）
 * - エラーハンドリングの統一
 * - 本番環境では詳細エラーを隠蔽
 * - カスタムエラークラスを適切に処理
 *
 * @note next-safe-action v8はStandard Schema v1を使用。
 * Valibot v1はネイティブでStandard Schemaをサポートしているため、
 * アダプターは不要。
 */
export const actionClient = createSafeActionClient({
  handleServerError(error) {
    // カスタムエラークラスは詳細を返す
    if (error instanceof NotFoundError) {
      return error.message;
    }

    // 本番環境では詳細を隠す
    if (env.NODE_ENV === "production") {
      actionLogger.error({ err: error }, "Server action failed");
      return "Internal server error";
    }

    // 開発環境では詳細を返す
    actionLogger.error({ err: error }, "Server action failed");
    return error instanceof Error ? error.message : "Unknown error";
  },
});

/**
 * 認証が必要なActionsのクライアント（将来的に使用）
 */
export const authActionClient = actionClient.use(async ({ next }) => {
  // 将来的に認証チェックを追加
  // const session = await getSession();
  // if (!session) throw new Error("Unauthorized");

  return next({
    ctx: {
      // userId: session.userId,
    },
  });
});
