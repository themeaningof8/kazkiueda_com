import type { AccessArgs } from "payload";
import { describe, expect, test } from "vitest";
import { authenticatedOnly } from "@/collections/access";

// 型安全なテストデータ作成ヘルパー
const createTestArgs = (user?: unknown): AccessArgs => ({
  req: {
    user,
  } as any,
});

describe("authenticatedOnly", () => {
  test("認証済みユーザー（userが存在）の場合、trueを返す", () => {
    const mockUser = { id: "1", email: "user@example.com" };
    const args = createTestArgs(mockUser);

    const result = authenticatedOnly(args);

    expect(result).toBe(true);
  });

  test("未認証ユーザー（userがundefined）の場合、falseを返す", () => {
    const args = createTestArgs(undefined);

    const result = authenticatedOnly(args);

    expect(result).toBe(false);
  });

  test("ユーザーオブジェクトがnullの場合、falseを返す", () => {
    const args = createTestArgs(null);

    const result = authenticatedOnly(args);

    expect(result).toBe(false);
  });

  test("req.userがundefinedの場合、エラーが発生せずにfalseを返す", () => {
    // reqオブジェクトは存在するがuserがundefinedの場合
    const args = createTestArgs();

    const result = authenticatedOnly(args);

    expect(result).toBe(false);
  });

  test("様々なユーザーオブジェクトで正しく動作する", () => {
    // 空のオブジェクト
    const result1 = authenticatedOnly(createTestArgs({}));
    expect(result1).toBe(true);

    // 数値IDのユーザー
    const result2 = authenticatedOnly(createTestArgs({ id: 123 }));
    expect(result2).toBe(true);

    // 文字列IDのユーザー
    const result3 = authenticatedOnly(createTestArgs({ id: "abc" }));
    expect(result3).toBe(true);
  });
});
