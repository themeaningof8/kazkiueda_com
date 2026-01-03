import type { Access } from "payload";

/**
 * 認証済みユーザーのみアクセス可能な共通アクセス制御
 */
export const authenticatedOnly: Access = ({ req: { user } }) => !!user;
