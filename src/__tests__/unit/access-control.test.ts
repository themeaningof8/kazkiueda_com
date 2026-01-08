import { describe, expect, test } from "vitest";
import { authenticatedOnly } from "@/collections/access";

describe("authenticatedOnly", () => {
  test("認証済みユーザー（userが存在）の場合、trueを返す", () => {
    const mockUser = { id: "1", email: "user@example.com" };
    const mockReq = { user: mockUser };

    const result = authenticatedOnly({ req: mockReq } as any);

    expect(result).toBe(true);
  });

  test("未認証ユーザー（userがundefined）の場合、falseを返す", () => {
    const mockReq = { user: undefined };

    const result = authenticatedOnly({ req: mockReq } as any);

    expect(result).toBe(false);
  });

  test("ユーザーオブジェクトがnullの場合、falseを返す", () => {
    const mockReq = { user: null };

    const result = authenticatedOnly({ req: mockReq } as any);

    expect(result).toBe(false);
  });

  test("req.userがundefinedの場合、エラーが発生せずにfalseを返す", () => {
    // reqオブジェクトは存在するがuserがundefinedの場合
    const mockReq = {};

    const result = authenticatedOnly({ req: mockReq } as any);

    expect(result).toBe(false);
  });

  test("様々なユーザーオブジェクトで正しく動作する", () => {
    // 空のオブジェクト
    const result1 = authenticatedOnly({ req: { user: {} } } as any);
    expect(result1).toBe(true);

    // 数値IDのユーザー
    const result2 = authenticatedOnly({ req: { user: { id: 123 } } } as any);
    expect(result2).toBe(true);

    // 文字列IDのユーザー
    const result3 = authenticatedOnly({ req: { user: { id: "abc" } } } as any);
    expect(result3).toBe(true);
  });
});
