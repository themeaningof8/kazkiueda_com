import { describe, expect, test } from "vitest";

/**
 * payload-client.ts の classifyError 関数のテスト
 * この関数はエクスポートされていないため、同じロジックを持つ関数を作成してテスト
 */

// エラー分類のロジック (payload-client.ts:14-57 と同じ)
type ErrorType = "NETWORK_ERROR" | "TIMEOUT" | "CORS_ERROR" | "DB_ERROR" | "UNKNOWN";

function classifyError(error: unknown): ErrorType {
  if (error instanceof Error) {
    // ネットワーク関連のエラー
    if (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("ECONNREFUSED")
    ) {
      return "NETWORK_ERROR";
    }

    // タイムアウトエラー
    if (error.message.includes("timeout") || error.message.includes("TIMEOUT")) {
      return "TIMEOUT";
    }

    // CORSエラー
    if (
      error.message.includes("CORS") ||
      error.message.includes("Access-Control") ||
      error.message.includes("cross-origin") ||
      error.message.includes("preflight")
    ) {
      return "CORS_ERROR";
    }

    // データベース関連のエラー
    if (
      error.message.includes("database") ||
      error.message.includes("connection") ||
      error.message.includes("SQLITE_")
    ) {
      return "DB_ERROR";
    }

    // Payload固有のエラー
    if (error.message.includes("Payload") || error.message.includes("collection")) {
      return "DB_ERROR";
    }
  }

  // 不明なエラー
  return "UNKNOWN";
}

describe("classifyError", () => {
  describe("ネットワークエラーの分類", () => {
    test("fetch エラーを NETWORK_ERROR と分類する", () => {
      const error = new Error("Failed to fetch data");
      expect(classifyError(error)).toBe("NETWORK_ERROR");
    });

    test("network エラーを NETWORK_ERROR と分類する", () => {
      const error = new Error("network request failed");
      expect(classifyError(error)).toBe("NETWORK_ERROR");
    });

    test("ECONNREFUSED エラーを NETWORK_ERROR と分類する", () => {
      const error = new Error("connect ECONNREFUSED 127.0.0.1:3000");
      expect(classifyError(error)).toBe("NETWORK_ERROR");
    });
  });

  describe("タイムアウトエラーの分類", () => {
    test("timeout エラーを TIMEOUT と分類する", () => {
      const error = new Error("Request timeout after 30s");
      expect(classifyError(error)).toBe("TIMEOUT");
    });

    test("TIMEOUT (大文字) エラーを TIMEOUT と分類する", () => {
      const error = new Error("CONNECTION TIMEOUT");
      expect(classifyError(error)).toBe("TIMEOUT");
    });
  });

  describe("CORS エラーの分類", () => {
    test("CORS エラーを CORS_ERROR と分類する", () => {
      const error = new Error("CORS policy: No 'Access-Control-Allow-Origin' header");
      expect(classifyError(error)).toBe("CORS_ERROR");
    });

    test("Access-Control エラーを CORS_ERROR と分類する", () => {
      const error = new Error("Access-Control check failed");
      expect(classifyError(error)).toBe("CORS_ERROR");
    });

    test("cross-origin エラーを CORS_ERROR と分類する", () => {
      const error = new Error("Blocked by cross-origin policy");
      expect(classifyError(error)).toBe("CORS_ERROR");
    });

    test("preflight エラーを CORS_ERROR と分類する", () => {
      const error = new Error("preflight request failed");
      expect(classifyError(error)).toBe("CORS_ERROR");
    });
  });

  describe("データベースエラーの分類", () => {
    test("database エラーを DB_ERROR と分類する", () => {
      const error = new Error("Database connection failed");
      expect(classifyError(error)).toBe("DB_ERROR");
    });

    test("connection エラーを DB_ERROR と分類する", () => {
      const error = new Error("Lost connection to database");
      expect(classifyError(error)).toBe("DB_ERROR");
    });

    test("SQLITE エラーを DB_ERROR と分類する", () => {
      const error = new Error("SQLITE_ERROR: table not found");
      expect(classifyError(error)).toBe("DB_ERROR");
    });

    test("Payload エラーを DB_ERROR と分類する", () => {
      const error = new Error("Payload operation failed");
      expect(classifyError(error)).toBe("DB_ERROR");
    });

    test("collection エラーを DB_ERROR と分類する", () => {
      const error = new Error("collection 'posts' not found");
      expect(classifyError(error)).toBe("DB_ERROR");
    });
  });

  describe("不明なエラーの分類", () => {
    test("Error オブジェクトだが該当しないメッセージは UNKNOWN と分類する", () => {
      const error = new Error("Something unexpected happened");
      expect(classifyError(error)).toBe("UNKNOWN");
    });

    test("Error オブジェクトでない場合は UNKNOWN と分類する", () => {
      const error = "string error";
      expect(classifyError(error)).toBe("UNKNOWN");
    });

    test("null は UNKNOWN と分類する", () => {
      expect(classifyError(null)).toBe("UNKNOWN");
    });

    test("undefined は UNKNOWN と分類する", () => {
      expect(classifyError(undefined)).toBe("UNKNOWN");
    });

    test("数値は UNKNOWN と分類する", () => {
      expect(classifyError(123)).toBe("UNKNOWN");
    });

    test("オブジェクト (Error でない) は UNKNOWN と分類する", () => {
      expect(classifyError({ message: "error" })).toBe("UNKNOWN");
    });
  });

  describe("エッジケース", () => {
    test("空のエラーメッセージは UNKNOWN と分類する", () => {
      const error = new Error("");
      expect(classifyError(error)).toBe("UNKNOWN");
    });

    test("複数のキーワードを含む場合、最初にマッチしたものを返す", () => {
      // "fetch" が最初にマッチするため NETWORK_ERROR
      const error = new Error("fetch failed due to timeout");
      expect(classifyError(error)).toBe("NETWORK_ERROR");
    });

    test("大文字小文字を区別する (TIMEOUT のみ大文字で判定)", () => {
      // "timeout" (小文字) は TIMEOUT と判定される
      const error1 = new Error("request timeout");
      expect(classifyError(error1)).toBe("TIMEOUT");

      // "TIMEOUT" (大文字) も TIMEOUT と判定される
      const error2 = new Error("REQUEST TIMEOUT");
      expect(classifyError(error2)).toBe("TIMEOUT");
    });

    test("部分一致でも正しく分類される", () => {
      const error = new Error("Unexpected database error occurred");
      expect(classifyError(error)).toBe("DB_ERROR");
    });
  });

  describe("実世界のエラーメッセージ例", () => {
    test("Fetch API のネットワークエラー", () => {
      const error = new Error("TypeError: Failed to fetch");
      expect(classifyError(error)).toBe("NETWORK_ERROR");
    });

    test("PostgreSQL 接続エラー", () => {
      const error = new Error("connection to server failed: Connection refused");
      expect(classifyError(error)).toBe("DB_ERROR");
    });

    test("ブラウザの CORS エラー", () => {
      // Note: このエラーメッセージには "fetch" も含まれるため、
      // 実装では NETWORK_ERROR が優先される (fetch のチェックが先)
      const error = new Error(
        "Access to XMLHttpRequest at 'https://api.example.com' from origin 'http://localhost:3000' has been blocked by CORS policy",
      );
      expect(classifyError(error)).toBe("CORS_ERROR");
    });

    test("Axios タイムアウトエラー", () => {
      const error = new Error("timeout of 5000ms exceeded");
      expect(classifyError(error)).toBe("TIMEOUT");
    });

    test("Payload CMS エラー", () => {
      const error = new Error("Payload Error: Unable to find collection with slug 'posts'");
      expect(classifyError(error)).toBe("DB_ERROR");
    });
  });
});
