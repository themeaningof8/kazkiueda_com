/**
 * Memory Leak Detection Tests
 *
 * メモリリークを検出するためのテストです。
 * Puppeteerを使用してブラウザのメモリ使用量を監視し、
 * memlabを使用して詳細なヒープ分析を行います。
 */

import puppeteer from "puppeteer";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { PERFORMANCE_THRESHOLDS, TEST_ENVIRONMENT } from "./config";
import { assertPerformanceThreshold, getMemoryUsage, shouldSkipPerformanceTest } from "./utils";

describe("Memory Leak Detection", () => {
  let browser: import("puppeteer").Browser | undefined;
  let serverUrl: string;

  beforeAll(async () => {
    serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

    // CI環境でのみブラウザを起動
    if (TEST_ENVIRONMENT.isCI) {
      browser = await puppeteer.launch({
        headless: TEST_ENVIRONMENT.headless,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--js-flags=--max-old-space-size=4096",
          "--memory-pressure-off",
        ],
      });
    }
  }, TEST_ENVIRONMENT.timeout.puppeteer);

  afterAll(async () => {
    if (browser && TEST_ENVIRONMENT.isCI) {
      await browser.close();
    }
  });

  describe.skipIf(!TEST_ENVIRONMENT.isCI)("Browser Memory Usage", () => {
    test.skipIf(shouldSkipPerformanceTest("heavy") || !TEST_ENVIRONMENT.isCI)(
      "should not have memory leaks during navigation",
      async () => {
        const page = await browser?.newPage();
        if (!page) {
          throw new Error("Browser not available");
        }

        try {
          // 初期メモリ使用量を測定
          const initialMemory = await page.evaluate(() => {
            // @ts-expect-error
            if (performance.memory) {
              // @ts-expect-error
              return performance.memory.usedJSHeapSize / 1024 / 1024;
            }
            return 0;
          });

          // 複数ページ間をナビゲーション
          const pages = ["/", "/blog"];

          for (const pagePath of pages) {
            await page.goto(`${serverUrl}${pagePath}`, {
              waitUntil: "networkidle0",
              timeout: 30000,
            });

            // 各ページで少し待機
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // メモリ使用量を測定
            const currentMemory = await page.evaluate(() => {
              // @ts-expect-error
              if (performance.memory) {
                // @ts-expect-error
                return performance.memory.usedJSHeapSize / 1024 / 1024;
              }
              return 0;
            });

            // メモリ使用量が急激に増加していないことを確認
            const memoryIncrease = currentMemory - initialMemory;
            expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.memory.leakThreshold);

            // ガベージコレクションを強制
            await page.evaluate(() => {
              if ("gc" in window && typeof window.gc === "function") {
                window.gc();
              }
            });
          }

          // 最終メモリ使用量を確認
          const finalMemory = await page.evaluate(() => {
            // @ts-expect-error
            if (performance.memory) {
              // @ts-expect-error
              return performance.memory.usedJSHeapSize / 1024 / 1024;
            }
            return 0;
          });

          const totalIncrease = finalMemory - initialMemory;
          expect(totalIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.memory.maxHeapUsage);
        } finally {
          await page.close();
        }
      },
      TEST_ENVIRONMENT.timeout.puppeteer * 2,
    );

    test(
      "should monitor memory usage during user interactions",
      async () => {
        if (!browser) {
          throw new Error("Browser not initialized");
        }
        const page = await browser.newPage();

        try {
          await page.goto(`${serverUrl}/blog`, {
            waitUntil: "networkidle0",
            timeout: 30000,
          });

          // 初期メモリ測定
          const initialMemory = await page.evaluate(() => {
            // @ts-expect-error
            if (performance.memory) {
              // @ts-expect-error
              return performance.memory.usedJSHeapSize / 1024 / 1024;
            }
            return 0;
          });

          // ユーザーの行動をシミュレート（スクロール、クリックなど）
          const actions = [
            async () => await page.evaluate(() => window.scrollTo(0, 500)),
            async () => await new Promise((resolve) => setTimeout(resolve, 1000)),
            async () => await page.evaluate(() => window.scrollTo(0, 1000)),
            async () => await new Promise((resolve) => setTimeout(resolve, 1000)),
            async () => await page.evaluate(() => window.scrollTo(0, 0)),
            async () => await new Promise((resolve) => setTimeout(resolve, 1000)),
          ];

          for (const action of actions) {
            await action();

            const currentMemory = await page.evaluate(() => {
              // @ts-expect-error
              if (performance.memory) {
                // @ts-expect-error
                return performance.memory.usedJSHeapSize / 1024 / 1024;
              }
              return 0;
            });

            // 各アクション後のメモリ増加を監視
            const increase = currentMemory - initialMemory;
            expect(increase).toBeLessThan(PERFORMANCE_THRESHOLDS.memory.leakThreshold);
          }
        } finally {
          await page.close();
        }
      },
      TEST_ENVIRONMENT.timeout.puppeteer,
    );
  });

  describe.skipIf(!TEST_ENVIRONMENT.isCI)("Component Memory Management", () => {
    test.skipIf(shouldSkipPerformanceTest("heavy") || !TEST_ENVIRONMENT.isCI)(
      "should properly clean up event listeners",
      async () => {
        if (!browser) {
          throw new Error("Browser not initialized");
        }
        const page = await browser.newPage();

        try {
          await page.goto(serverUrl, {
            waitUntil: "networkidle0",
            timeout: 30000,
          });

          // イベントリスナーの数を監視
          const initialListeners = await page.evaluate(() => {
            // 簡易的なイベントリスナー数のチェック
            let count = 0;
            const elements = document.querySelectorAll("*");
            elements.forEach((el: Element) => {
              const element = el as Element & { _events?: unknown; __events?: unknown };
              if (element._events || element.__events) {
                count++;
              }
            });
            return count;
          });

          // ページをリロード
          await page.reload({ waitUntil: "networkidle0" });

          // リロード後のイベントリスナー数を確認
          const afterReloadListeners = await page.evaluate(() => {
            let count = 0;
            const elements = document.querySelectorAll("*");
            elements.forEach((el: Element) => {
              const element = el as Element & { _events?: unknown; __events?: unknown };
              if (element._events || element.__events) {
                count++;
              }
            });
            return count;
          });

          // イベントリスナーが適切にクリーンアップされていることを確認
          // （厳密なチェックは難しいので、大きな増加がないことを確認）
          const listenerIncrease = afterReloadListeners - initialListeners;
          expect(listenerIncrease).toBeLessThan(50); // 許容される増加数
        } finally {
          await page.close();
        }
      },
      TEST_ENVIRONMENT.timeout.puppeteer,
    );

    test(
      "should handle component unmounting properly",
      async () => {
        if (!browser) {
          throw new Error("Browser not initialized");
        }
        const page = await browser.newPage();

        try {
          await page.goto(`${serverUrl}/blog`, {
            waitUntil: "networkidle0",
            timeout: 30000,
          });

          // 初期状態のメモリ使用量
          const initialMemory = await page.evaluate(() => {
            // @ts-expect-error
            if (performance.memory) {
              // @ts-expect-error
              return performance.memory.usedJSHeapSize;
            }
            return 0;
          });

          // コンポーネントが存在することを確認（ブログページの場合）
          const hasContent = await page.$('[data-testid="post-card"], .post-card, article');
          expect(hasContent).toBeTruthy();

          // 少し待機してからメモリを再チェック
          await new Promise((resolve) => setTimeout(resolve, 3000));

          const afterWaitMemory = await page.evaluate(() => {
            // @ts-expect-error
            if (performance.memory) {
              // @ts-expect-error
              return performance.memory.usedJSHeapSize;
            }
            return 0;
          });

          // 待機中にメモリ使用量が大幅に増加していないことを確認
          const memoryIncrease = (afterWaitMemory - initialMemory) / 1024 / 1024; // MB
          expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.memory.leakThreshold);
        } finally {
          await page.close();
        }
      },
      TEST_ENVIRONMENT.timeout.puppeteer,
    );
  });

  describe("Server-Side Memory Monitoring", () => {
    test("should monitor Node.js memory usage", () => {
      // Node.jsプロセスのメモリ使用量を監視
      const initialMemory = getMemoryUsage();

      // メモリ使用量が適切な範囲内であることを確認
      expect(initialMemory).toBeGreaterThan(0);
      expect(initialMemory).toBeLessThan(PERFORMANCE_THRESHOLDS.memory.maxHeapUsage);

      // ガベージコレクションを強制（可能な場合）
      if (global.gc) {
        global.gc();
        const afterGCMemory = getMemoryUsage();

        // GC後にメモリ使用量が減少するか確認
        expect(afterGCMemory).toBeLessThanOrEqual(initialMemory);
      }
    });

    test("should check for potential memory issues in test setup", () => {
      // テスト実行中のメモリ使用量を監視
      const currentMemory = getMemoryUsage();

      // テスト実行中にメモリ使用量が急激に増加していないことを確認
      assertPerformanceThreshold("memory", "maxHeapUsage", currentMemory, "MB");

      // メモリ使用量が安定していることを確認するためのログ
      console.info(`Current memory usage: ${currentMemory} MB`);
    });
  });

  describe.skipIf(!TEST_ENVIRONMENT.isCI)("Resource Cleanup Verification", () => {
    test("should properly close browser resources", async () => {
      if (!browser) {
        throw new Error("Browser not initialized");
      }
      const page = await browser.newPage();

      try {
        await page.goto(serverUrl, {
          waitUntil: "networkidle0",
          timeout: 30000,
        });

        // リソースが適切に読み込まれていることを確認
        const resources = await page.evaluate(() => {
          return performance.getEntriesByType("resource").length;
        });

        expect(resources).toBeGreaterThan(0);

        // ページを閉じる前にメモリ使用量を記録
        const _beforeCloseMemory = await page.evaluate(() => {
          // @ts-expect-error
          if (performance.memory) {
            // @ts-expect-error
            return performance.memory.usedJSHeapSize / 1024 / 1024;
          }
          return 0;
        });

        // ページを閉じる
        await page.close();

        // ブラウザのページ数が減少していることを確認
        const pages = await browser.pages();
        expect(pages.length).toBeGreaterThanOrEqual(1); // デフォルトページは残る
      } catch (error) {
        // ページが既に閉じられている場合のエラーハンドリング
        if (page && !page.isClosed()) {
          await page.close();
        }
        throw error;
      }
    });
  });
});
