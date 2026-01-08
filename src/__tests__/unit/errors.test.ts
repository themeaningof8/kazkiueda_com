import { describe, expect, test } from "vitest";
import { DatabaseError, NotFoundError } from "@/lib/errors";

describe("NotFoundError", () => {
  test("デフォルトメッセージでインスタンス化", () => {
    const error = new NotFoundError();
    expect(error.message).toBe("NOT_FOUND");
    expect(error.name).toBe("NotFoundError");
    expect(error).toBeInstanceOf(Error);
  });

  test("カスタムメッセージでインスタンス化", () => {
    const error = new NotFoundError("Custom message");
    expect(error.message).toBe("Custom message");
    expect(error.name).toBe("NotFoundError");
    expect(error).toBeInstanceOf(Error);
  });

  test("Errorクラスを継承している", () => {
    const error = new NotFoundError();
    expect(error instanceof Error).toBe(true);
  });
});

describe("DatabaseError", () => {
  test("デフォルトメッセージでインスタンス化", () => {
    const error = new DatabaseError();
    expect(error.message).toBe("DB_ERROR");
    expect(error.name).toBe("DatabaseError");
    expect(error).toBeInstanceOf(Error);
  });

  test("カスタムメッセージでインスタンス化", () => {
    const error = new DatabaseError("Connection failed");
    expect(error.message).toBe("Connection failed");
    expect(error.name).toBe("DatabaseError");
    expect(error).toBeInstanceOf(Error);
  });

  test("Errorクラスを継承している", () => {
    const error = new DatabaseError();
    expect(error instanceof Error).toBe(true);
  });
});

describe("エラーハンドリングの境界値テスト", () => {
  describe("NotFoundError", () => {
    test("空文字列のメッセージを渡した場合", () => {
      const error = new NotFoundError("");
      expect(error.message).toBe("");
      expect(error.name).toBe("NotFoundError");
    });

    test("非常に長いメッセージを渡した場合", () => {
      const longMessage = "A".repeat(10000);
      const error = new NotFoundError(longMessage);
      expect(error.message).toBe(longMessage);
      expect(error.message.length).toBe(10000);
    });

    test("特殊文字を含むメッセージを渡した場合", () => {
      const specialMessage = "エラー: <script>alert('XSS')</script>";
      const error = new NotFoundError(specialMessage);
      expect(error.message).toBe(specialMessage);
    });

    test("改行を含むメッセージを渡した場合", () => {
      const multilineMessage = "エラーが発生しました\n詳細: データが見つかりません";
      const error = new NotFoundError(multilineMessage);
      expect(error.message).toBe(multilineMessage);
    });
  });

  describe("DatabaseError", () => {
    test("空文字列のメッセージを渡した場合", () => {
      const error = new DatabaseError("");
      expect(error.message).toBe("");
      expect(error.name).toBe("DatabaseError");
    });

    test("非常に長いメッセージを渡した場合", () => {
      const longMessage = "B".repeat(10000);
      const error = new DatabaseError(longMessage);
      expect(error.message).toBe(longMessage);
      expect(error.message.length).toBe(10000);
    });

    test("SQLインジェクションパターンを含むメッセージを渡した場合", () => {
      const sqlMessage = "Error: SELECT * FROM users WHERE id = 1; DROP TABLE users;";
      const error = new DatabaseError(sqlMessage);
      expect(error.message).toBe(sqlMessage);
    });
  });
});

describe("エラーのスタックトレース", () => {
  test("NotFoundErrorはスタックトレースを持つ", () => {
    const error = new NotFoundError("Test error");
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("NotFoundError");
  });

  test("DatabaseErrorはスタックトレースを持つ", () => {
    const error = new DatabaseError("Test error");
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("DatabaseError");
  });
});

describe("エラーの型判定", () => {
  test("NotFoundErrorとDatabaseErrorを区別できる", () => {
    const notFoundError = new NotFoundError();
    const databaseError = new DatabaseError();

    expect(notFoundError instanceof NotFoundError).toBe(true);
    expect(notFoundError instanceof DatabaseError).toBe(false);
    expect(databaseError instanceof DatabaseError).toBe(true);
    expect(databaseError instanceof NotFoundError).toBe(false);
  });

  test("両方のエラーはErrorクラスのインスタンス", () => {
    const notFoundError = new NotFoundError();
    const databaseError = new DatabaseError();

    expect(notFoundError instanceof Error).toBe(true);
    expect(databaseError instanceof Error).toBe(true);
  });

  test("エラー名で型を判定できる", () => {
    const notFoundError = new NotFoundError();
    const databaseError = new DatabaseError();

    expect(notFoundError.name).toBe("NotFoundError");
    expect(databaseError.name).toBe("DatabaseError");
  });
});

// 型ガード関数：Errorオブジェクトの構造を検証
function isErrorObject(obj: unknown): obj is { name: string; message: string } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "name" in obj &&
    "message" in obj &&
    typeof obj.name === "string" &&
    typeof obj.message === "string"
  );
}

describe("エラーのシリアライゼーション", () => {
  test("NotFoundErrorをJSON化できる", () => {
    const error = new NotFoundError("Test message");
    const json = JSON.stringify({
      name: error.name,
      message: error.message,
    });

    const parsed = JSON.parse(json);
    if (!isErrorObject(parsed)) {
      throw new Error("Parsed object is not a valid error object");
    }

    expect(parsed.name).toBe("NotFoundError");
    expect(parsed.message).toBe("Test message");
  });

  test("DatabaseErrorをJSON化できる", () => {
    const error = new DatabaseError("Connection timeout");
    const json = JSON.stringify({
      name: error.name,
      message: error.message,
    });

    const parsed = JSON.parse(json);
    if (!isErrorObject(parsed)) {
      throw new Error("Parsed object is not a valid error object");
    }

    expect(parsed.name).toBe("DatabaseError");
    expect(parsed.message).toBe("Connection timeout");
  });
});

describe("エラーの再スロー", () => {
  test("NotFoundErrorをキャッチして再スローできる", () => {
    expect(() => {
      try {
        throw new NotFoundError("Original error");
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new NotFoundError(`Re-thrown: ${error.message}`);
        }
      }
    }).toThrow("Re-thrown: Original error");
  });

  test("DatabaseErrorをキャッチして再スローできる", () => {
    expect(() => {
      try {
        throw new DatabaseError("Query failed");
      } catch (error) {
        if (error instanceof DatabaseError) {
          throw new DatabaseError(`Wrapped: ${error.message}`);
        }
      }
    }).toThrow("Wrapped: Query failed");
  });
});
