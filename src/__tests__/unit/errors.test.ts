import { describe, test, expect } from "vitest";
import { NotFoundError, DatabaseError } from "@/lib/errors";

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
