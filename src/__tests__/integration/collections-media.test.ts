import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { createTestDbPool, destroyTestDbPool, truncateAllTables } from "@/test/db";
import { destroyTestPayload, getTestPayload } from "@/test/payload";
import { createTestUser } from "@/test/helpers/factories";
import { findAsUnauthenticated, findAsUser } from "@/test/helpers/auth";

describe("collections/Media.ts Integration Tests", () => {
  const pool = createTestDbPool();
  const payloadKey = `collections-media-${Date.now()}`;

  beforeAll(async () => {
    await truncateAllTables(pool);
    await getTestPayload(payloadKey);
  });

  afterEach(async () => {
    await truncateAllTables(pool);
  });

  afterAll(async () => {
    await destroyTestPayload(payloadKey);
    await destroyTestDbPool(pool);
  });

  // テスト用の1x1ピクセル画像（Base64） - describeの外で定義
  const TINY_PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );

  /**
   * テスト用ファイルオブジェクトを作成するヘルパー関数
   */
  function createTestFile(buffer: Buffer, filename: string, mimetype: string) {
    return {
      data: buffer,
      mimetype,
      name: filename,
      size: buffer.length,
    };
  }

  describe("アクセス制御: read", () => {
    test("1. 誰でも読める", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // Given: メディアファイルが存在
      const media = await payload.create({
        collection: "media",
        data: {
          alt: "Test Media",
        },
        file: createTestFile(TINY_PNG, "test.png", "image/png"),
        user,
        overrideAccess: false,
      });

      // When: 未認証でメディアを取得
      const result = await findAsUnauthenticated(payload, "media");

      // Then: 取得できる
      expect(result.docs).toHaveLength(1);
      expect(result.docs[0].id).toBe(media.id);
    });
  });

  describe("アクセス制御: create", () => {
    test("2. 未認証ユーザーはアップロードできない", async () => {
      const payload = await getTestPayload(payloadKey);

      // When: 未認証でメディア作成
      await expect(
        payload.create({
          collection: "media",
          data: {
            alt: "Test Media",
          },
          file: createTestFile(TINY_PNG, "test.png", "image/png"),
          overrideAccess: false,
        })
      ).rejects.toThrow();
    });

    test("3. 認証ユーザーはアップロードできる", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // When: 認証してメディア作成
      const media = await payload.create({
        collection: "media",
        data: {
          alt: "Test Media",
        },
        file: createTestFile(TINY_PNG, "test.png", "image/png"),
        user,
        overrideAccess: false,
      });

      // Then: 作成成功
      expect(media.alt).toBe("Test Media");
    });
  });

  describe("アクセス制御: update", () => {
    test("4. 認証ユーザーは更新できる", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // Given: メディアファイルが存在
      const media = await payload.create({
        collection: "media",
        data: {
          alt: "Original Alt",
        },
        file: createTestFile(TINY_PNG, "test.png", "image/png"),
        user,
        overrideAccess: false,
      });

      // When: 更新
      const updated = await payload.update({
        collection: "media",
        id: media.id,
        data: {
          alt: "Updated Alt",
        },
        user,
        overrideAccess: false,
      });

      // Then: 更新成功
      expect(updated.alt).toBe("Updated Alt");
    });
  });

  describe("アクセス制御: delete", () => {
    test("5. 認証ユーザーは削除できる", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // Given: メディアファイルが存在
      const media = await payload.create({
        collection: "media",
        data: {
          alt: "Test Media",
        },
        file: createTestFile(TINY_PNG, "test.png", "image/png"),
        user,
        overrideAccess: false,
      });

      // When: 削除
      await payload.delete({
        collection: "media",
        id: media.id,
        user,
        overrideAccess: false,
      });

      // Then: 削除成功
      const result = await payload.find({
        collection: "media",
        where: { id: { equals: media.id } },
        overrideAccess: true,
      });
      expect(result.docs).toHaveLength(0);
    });
  });

  describe("ファイルアップロード", () => {

    test("6. 認証ユーザーは画像をアップロードできる（ダミーファイル使用）", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // When: 認証して画像アップロード
      const media = await payload.create({
        collection: "media",
        data: {
          alt: "Test Image",
        },
        file: createTestFile(TINY_PNG, "test.png", "image/png"),
        user,
        overrideAccess: false,
      });

      // Then: アップロード成功
      expect(media.filename).toBeDefined();
      expect(media.mimeType).toBe("image/png");
    });

    test("7. MIMEタイプ制限（image/*のみ許可、非画像ファイルは拒否）", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // Test multiple non-image file types to ensure comprehensive MIME type restriction
      const testCases = [
        { name: "PDF file", content: Buffer.from("PDF content"), mimeType: "application/pdf" },
        { name: "Text file", content: Buffer.from("plain text content"), mimeType: "text/plain" },
        { name: "JSON file", content: Buffer.from('{"test": "data"}'), mimeType: "application/json" },
      ];

      for (const testCase of testCases) {
        await expect(
          payload.create({
            collection: "media",
            data: {
              alt: `${testCase.name}`,
            },
            file: createTestFile(testCase.content, `test.${testCase.mimeType.split("/")[1]}`, testCase.mimeType),
            user,
            overrideAccess: false,
          })
        ).rejects.toThrow(/MIME type|file|invalid/i);
      }
    });

    test.todo("8. ファイルサイズ制限（Payloadのupload設定で制御）", async () => {
      // TODO: Media.tsにファイルサイズ制限(maxSize)が設定されていないため実装保留
      // Media.tsのupload設定にmaxSizeを追加した後、このテストを実装する
      // 現在のMedia.tsではファイルサイズ制限が設定されていないためテスト不可能
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // When: 大きなファイルをアップロード
      const largeFile = Buffer.alloc(1024 * 1024 * 10); // 10MB
      await expect(
        payload.create({
          collection: "media",
          data: {
            alt: "Large File",
          },
          file: createTestFile(largeFile, "large.png", "image/png"),
          user,
          overrideAccess: false,
        })
      ).rejects.toThrow(/size|limit/i);
    });


    test("9. 画像サイズの自動生成（thumbnail, card）", async () => {
      const payload = await getTestPayload(payloadKey);
      const user = await createTestUser(payload);

      // When: 画像をアップロード
      const media = await payload.create({
        collection: "media",
        data: {
          alt: "Test Image",
        },
        file: createTestFile(TINY_PNG, "test.png", "image/png"),
        user,
        overrideAccess: false,
      });

      // Then: サムネイルとカードサイズが生成されている
      // Note: Payloadの自動リサイズ機能により、thumbnailとcardサイズのファイルが生成されるはず
      expect(media.sizes).toBeDefined();
      expect(media.sizes?.thumbnail).toBeDefined();
      expect(media.sizes?.card).toBeDefined();
    });
  });
});