import type { CollectionConfig } from "payload";
import type { User } from "@/payload-types";

// ロール値を定数としてエクスポート（型安全性とタイポ防止のため）
export const USER_ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  USER: "user",
} as const;

// Payload認証コンテキストのユーザーが適切な型を持つことを確認する型ガード
function hasRole(user: unknown): user is User {
  return (
    typeof user === "object" && user !== null && "role" in user && typeof user.role === "string"
  );
}

// 管理者または本人のみアクセス可能な共通アクセス制御ロジック
function adminOrSelfAccess({
  req: { user },
  doc,
}: {
  req: { user: unknown };
  doc?: { id?: number | string };
}) {
  if (!hasRole(user)) return false;
  if (user.role === USER_ROLES.ADMIN) return true;
  // docのidはstringまたはnumberの可能性があるため、文字列に変換して比較
  return String(user.id) === String(doc?.id);
}

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  access: {
    // 管理者は全件、一般ユーザーは自分のみ
    read: ({ req: { user } }) => {
      if (!hasRole(user)) return false;
      if (user.role === USER_ROLES.ADMIN) return true;
      return { id: { equals: user.id } };
    },
    create: async ({ req: { user, payload } }) => {
      // 初回ユーザー作成を許可（コレクションが空の場合）
      const usersCount = await payload.count({
        collection: "users",
      });
      if (usersCount.totalDocs === 0) return true;

      // 既存ユーザーがいる場合、管理者のみ作成可能
      return hasRole(user) && user.role === USER_ROLES.ADMIN;
    },
    // 管理者は全件、一般ユーザーは自分のみ
    update: ({ req: { user }, id }) => {
      if (!hasRole(user)) return false;
      if (user.role === USER_ROLES.ADMIN) return true;
      return user.id === id;
    },
    delete: ({ req: { user } }) => {
      // 管理者のみ削除可能（スパム/不正アカウント対応のため）
      return hasRole(user) && user.role === USER_ROLES.ADMIN;
    },
  },
  fields: [
    // 🔒 emailフィールドを明示的に定義してアクセス制御
    // auth: true のデフォルトemailを同名定義で上書き・拡張する
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
      access: {
        // メール露出を抑制（推奨）
        read: adminOrSelfAccess,
        // 管理者または本人のみ更新可能（パスワードリセット攻撃を防ぐ）
        update: adminOrSelfAccess,
      },
    },
    {
      name: "name",
      type: "text",
    },
    {
      name: "role",
      type: "select",
      options: [
        { label: "Admin", value: USER_ROLES.ADMIN },
        { label: "Editor", value: USER_ROLES.EDITOR },
        { label: "User", value: USER_ROLES.USER },
      ],
      defaultValue: USER_ROLES.USER,
      required: true,
      // 🔒 管理者のみrole変更可能（権限昇格攻撃を防ぐ）
      access: {
        update: ({ req: { user } }) => hasRole(user) && user.role === USER_ROLES.ADMIN,
      },
    },
  ],
};
