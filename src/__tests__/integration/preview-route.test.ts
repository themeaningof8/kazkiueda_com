import { NextRequest } from "next/server";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { GET as previewRouteGET } from "@/app/(frontend)/preview/route";
import { createTestDbPool, destroyTestDbPool, truncateAllTables } from "@/test/db";
import { destroyTestPayload, getTestPayload } from "@/test/payload";

/**
 * Preview Route HandlerのIntegrationテスト
 *
 * 注意: このテストは認証なしの400エラーのみをテストします。
 * 認証が必要なテスト（403確認）はE2Eテストに含まれています。
 *
 * Route Handlerを直接呼び出す方式で実装しています。
 * redirect()やdraftMode()は実際のNext.jsコンテキストでしか動作しないため、
 * これらの関数が呼ばれる前のバリデーション部分のみをテストします。
 */
describe("Preview Route Handler Integration", () => {
  const pool = createTestDbPool();
  const payloadKey = `preview-route-${Date.now()}`;

  beforeAll(async () => {
    // テスト用のpreview secretを設定
    vi.stubEnv("PAYLOAD_PREVIEW_SECRET", "test-preview-secret");
    await truncateAllTables(pool);
    await getTestPayload(payloadKey);
  });

  function createRequestWithValidSecret(url: string): NextRequest {
    // 有効なpreview secretをURLに追加
    const separator = url.includes("?") ? "&" : "?";
    const urlWithSecret = `${url}${separator}previewSecret=test-preview-secret`;
    return new NextRequest(new URL(urlWithSecret, "http://localhost:3000"));
  }

  afterAll(async () => {
    vi.unstubAllEnvs();
    await destroyTestPayload(payloadKey);
    await destroyTestDbPool(pool);
  });

  test("Open Redirect対策 - 外部URL拒否", async () => {
    const url =
      "http://localhost:3000/preview?collection=posts&slug=test-post&path=http://evil.com";
    const request = createRequestWithValidSecret(url);

    const response = await previewRouteGET(request);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain("Invalid redirect path");
  });

  test("Open Redirect対策 - スキームなし外部URL拒否", async () => {
    const url = "http://localhost:3000/preview?collection=posts&slug=test-post&path=//evil.com";
    const request = createRequestWithValidSecret(url);

    const response = await previewRouteGET(request);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain("Invalid redirect path");
  });

  test("Open Redirect対策 - 許可されないパス拒否", async () => {
    const url =
      "http://localhost:3000/preview?collection=posts&slug=test-post&path=/admin/dashboard";
    const request = createRequestWithValidSecret(url);

    const response = await previewRouteGET(request);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain("Invalid redirect path");
  });

  test("slug形式検証 - 不正なslug拒否", async () => {
    const url = "http://localhost:3000/preview?collection=posts&slug=invalid slug";
    const request = createRequestWithValidSecret(url);

    const response = await previewRouteGET(request);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain("Invalid slug format");
  });

  test("コレクション検証 - サポートされないコレクション拒否", async () => {
    const url = "http://localhost:3000/preview?collection=users&slug=test-user";
    const request = createRequestWithValidSecret(url);

    const response = await previewRouteGET(request);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain("Unsupported collection");
  });

  test("必須パラメータの欠如 - slugなし", async () => {
    const url = "http://localhost:3000/preview?collection=posts";
    const request = createRequestWithValidSecret(url);

    const response = await previewRouteGET(request);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain("Missing slug or collection");
  });

  test("必須パラメータの欠如 - collectionなし", async () => {
    const url = "http://localhost:3000/preview?slug=test-post";
    const request = createRequestWithValidSecret(url);

    const response = await previewRouteGET(request);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain("Missing slug or collection");
  });
});
