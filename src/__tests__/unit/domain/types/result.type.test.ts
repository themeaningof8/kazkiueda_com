import { describe, expect, it } from "vitest";
import { Result } from "@/domain/types/result.type";

describe("Result Type", () => {
  describe("ok", () => {
    it("成功結果を作成できる", () => {
      const result = Result.ok(42);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });
  });

  describe("fail", () => {
    it("失敗結果を作成できる", () => {
      const error = new Error("Something went wrong");
      const result = Result.fail(error);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(error);
      }
    });
  });

  describe("isSuccess", () => {
    it("成功結果に対してtrueを返す", () => {
      const result = Result.ok(42);
      expect(Result.isSuccess(result)).toBe(true);
    });

    it("失敗結果に対してfalseを返す", () => {
      const result = Result.fail(new Error("error"));
      expect(Result.isSuccess(result)).toBe(false);
    });
  });

  describe("isFailure", () => {
    it("失敗結果に対してtrueを返す", () => {
      const result = Result.fail(new Error("error"));
      expect(Result.isFailure(result)).toBe(true);
    });

    it("成功結果に対してfalseを返す", () => {
      const result = Result.ok(42);
      expect(Result.isFailure(result)).toBe(false);
    });
  });

  describe("map", () => {
    it("成功結果の値を変換できる", () => {
      const result = Result.ok(42);
      const mapped = Result.map(result, (n) => n * 2);
      expect(Result.isSuccess(mapped)).toBe(true);
      if (Result.isSuccess(mapped)) {
        expect(mapped.data).toBe(84);
      }
    });

    it("失敗結果はそのまま返す", () => {
      const error = new Error("error");
      const result = Result.fail<Error>(error);
      const mapped = Result.map(result, (n: number) => n * 2);
      expect(Result.isFailure(mapped)).toBe(true);
      if (Result.isFailure(mapped)) {
        expect(mapped.error).toBe(error);
      }
    });
  });

  describe("flatMap", () => {
    it("成功結果を連鎖できる", () => {
      const result = Result.ok(42);
      const chained = Result.flatMap(result, (n) => Result.ok(n * 2));
      expect(Result.isSuccess(chained)).toBe(true);
      if (Result.isSuccess(chained)) {
        expect(chained.data).toBe(84);
      }
    });

    it("連鎖中にエラーが発生した場合は失敗を返す", () => {
      const result = Result.ok(42);
      const chained = Result.flatMap(result, () => Result.fail(new Error("error")));
      expect(Result.isFailure(chained)).toBe(true);
    });

    it("最初から失敗の場合はそのまま返す", () => {
      const error = new Error("error");
      const result = Result.fail<Error>(error);
      const chained = Result.flatMap(result, (n: number) => Result.ok(n * 2));
      expect(Result.isFailure(chained)).toBe(true);
      if (Result.isFailure(chained)) {
        expect(chained.error).toBe(error);
      }
    });
  });

  describe("combine", () => {
    it("すべて成功の場合は成功を返す", () => {
      const results = [Result.ok(1), Result.ok(2), Result.ok(3)];
      const combined = Result.combine(results);
      expect(Result.isSuccess(combined)).toBe(true);
      if (Result.isSuccess(combined)) {
        expect(combined.data).toEqual([1, 2, 3]);
      }
    });

    it("1つでも失敗がある場合は失敗を返す", () => {
      const error = new Error("error");
      const results = [Result.ok(1), Result.fail<Error>(error), Result.ok(3)];
      const combined = Result.combine(results);
      expect(Result.isFailure(combined)).toBe(true);
      if (Result.isFailure(combined)) {
        expect(combined.error).toBe(error);
      }
    });
  });

  describe("mapError", () => {
    it("失敗結果のエラーを変換できる", () => {
      const result: Result<number, Error> = Result.fail(new Error("original error"));
      const mapped = Result.mapError(result, (error) => new Error(`mapped: ${error.message}`));
      expect(Result.isFailure(mapped)).toBe(true);
      if (Result.isFailure(mapped)) {
        expect(mapped.error.message).toBe("mapped: original error");
      }
    });

    it("成功結果はそのまま返す", () => {
      const result = Result.ok(42);
      const mapped = Result.mapError(result, (error: string) => new Error(`mapped: ${error}`));
      expect(Result.isSuccess(mapped)).toBe(true);
      if (Result.isSuccess(mapped)) {
        expect(mapped.data).toBe(42);
      }
    });
  });

  describe("getOrElse", () => {
    it("成功の場合は値を返す", () => {
      const result = Result.ok(42);
      const value = Result.getOrElse(result, 0);
      expect(value).toBe(42);
    });

    it("失敗の場合はデフォルト値を返す", () => {
      const result = Result.fail<Error>(new Error("error"));
      const value = Result.getOrElse(result, 0);
      expect(value).toBe(0);
    });
  });

  describe("tryCatch", () => {
    it("成功する関数の結果を成功Resultに変換する", () => {
      const result = Result.tryCatch(() => 42);
      expect(Result.isSuccess(result)).toBe(true);
      if (Result.isSuccess(result)) {
        expect(result.data).toBe(42);
      }
    });

    it("例外をスローする関数の結果を失敗Resultに変換する", () => {
      const result = Result.tryCatch(() => {
        throw new Error("error");
      });
      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.error.message).toBe("error");
      }
    });

    it("非Errorオブジェクトがスローされた場合もErrorに変換する", () => {
      const result = Result.tryCatch(() => {
        throw "string error";
      });
      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.error.message).toBe("string error");
      }
    });
  });

  describe("tryAsync", () => {
    it("成功するPromiseの結果を成功Resultに変換する", async () => {
      const result = await Result.tryAsync(async () => 42);
      expect(Result.isSuccess(result)).toBe(true);
      if (Result.isSuccess(result)) {
        expect(result.data).toBe(42);
      }
    });

    it("失敗するPromiseの結果を失敗Resultに変換する", async () => {
      const result = await Result.tryAsync(async () => {
        throw new Error("error");
      });
      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.error.message).toBe("error");
      }
    });

    it("非Errorオブジェクトがスローされた場合もErrorに変換する", async () => {
      const result = await Result.tryAsync(async () => {
        throw "string error";
      });
      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.error.message).toBe("string error");
      }
    });
  });
});
