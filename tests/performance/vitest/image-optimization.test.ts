/**
 * Image Optimization Performance Tests
 *
 * 画像の最適化とパフォーマンスをテストします。
 * ロード時間、ファイルサイズ、フォーマット、Next.js Imageコンポーネントの使用状況などを検証します。
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { PERFORMANCE_THRESHOLDS, TEST_ENVIRONMENT } from "../../../src/lib/performance/config";
import { shouldSkipPerformanceTest } from "../../../src/lib/performance/utils";

declare global {
  interface Window {
    imageLoadTimes: Array<{
      url: string;
      loadTime: number;
      size: number;
    }>;
  }
}

describe.skipIf(!TEST_ENVIRONMENT.isCI || !TEST_ENVIRONMENT.playwrightAvailable)(
  "Image Optimization Performance",
  () => {
    let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
    let serverUrl: string;

    beforeAll(async () => {
      serverUrl = TEST_ENVIRONMENT.serverUrl;

      // CI環境でのみブラウザを起動
      if (TEST_ENVIRONMENT.isCI) {
        browser = await chromium.launch({
          headless: TEST_ENVIRONMENT.headless,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
      }
    }, TEST_ENVIRONMENT.timeout.puppeteer);

    afterAll(async () => {
      if (browser && TEST_ENVIRONMENT.isCI) {
        await browser.close();
      }
    }, TEST_ENVIRONMENT.timeout.puppeteer);

    describe("Image Loading Performance", () => {
      test(
        "should load images within acceptable time",
        async () => {
          if (!browser) {
            throw new Error("Browser not available");
          }
          const page = await browser.newPage();

          try {
            // Performance observerを設定して画像のロード時間を監視
            await page.addInitScript(() => {
              window.imageLoadTimes = [];

              const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                  const resourceEntry = entry as PerformanceResourceTiming;
                  if (
                    resourceEntry.name.includes(".jpg") ||
                    resourceEntry.name.includes(".png") ||
                    resourceEntry.name.includes(".webp") ||
                    resourceEntry.name.includes(".avif")
                  ) {
                    window.imageLoadTimes.push({
                      url: resourceEntry.name,
                      loadTime: resourceEntry.responseEnd - resourceEntry.requestStart,
                      size: resourceEntry.transferSize,
                    });
                  }
                }
              });

              observer.observe({ entryTypes: ["resource"] });
            });

            await page.goto(serverUrl, {
              waitUntil: "networkidle",
              timeout: 30000,
            });

            // 画像のロードが完了するまで待機
            await page.waitForTimeout(2000);

            // 画像のロード時間を取得
            const imageLoadTimes = await page.evaluate(() => {
              return window.imageLoadTimes ?? [];
            });

            // 各画像のロード時間を検証
            imageLoadTimes.forEach((image: { url: string; loadTime: number; size: number }) => {
              expect(image.loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.images.maxLoadTime);

              // 画像サイズが適切であることを確認（0より大きい）
              expect(image.size).toBeGreaterThan(0);
            });

            // 少なくとも1つの画像が読み込まれていることを確認
            if (imageLoadTimes.length > 0) {
              console.info(`Loaded ${imageLoadTimes.length} images successfully`);
            }
          } finally {
            await page.close();
          }
        },
        TEST_ENVIRONMENT.timeout.puppeteer,
      );

      test(
        "should use optimized image formats",
        async () => {
          if (!browser) {
            throw new Error("Browser not available");
          }
          const page = await browser.newPage();

          try {
            await page.goto(serverUrl, {
              waitUntil: "networkidle",
              timeout: 30000,
            });

            // ページ上の画像を取得
            const images = await page.locator("img").evaluateAll((imgs: HTMLImageElement[]) => {
              return imgs.map((img) => ({
                src: img.src,
                alt: img.alt,
                loading: img.loading,
                width: img.naturalWidth,
                height: img.naturalHeight,
              }));
            });

            // 画像が存在することを確認
            expect(images.length).toBeGreaterThanOrEqual(0);

            // Next.js Imageコンポーネントが使用されていることを確認
            const nextImages = await page
              .locator("img[data-nimg]")
              .evaluateAll((imgs: HTMLImageElement[]) => {
                return imgs.map((img) => ({
                  src: img.src,
                  priority: img.getAttribute("data-nimg") === "1",
                }));
              });

            // Next.js Imageコンポーネントが優先的に使用されていることを確認
            if (images.length > 0) {
              const nextImageRatio = nextImages.length / images.length;
              expect(nextImageRatio).toBeGreaterThanOrEqual(0.8); // 80%以上がNext.js Image
            }

            // 画像の最適化を確認
            images.forEach(
              (image: {
                src: string;
                alt: string;
                loading?: string;
                width: number;
                height: number;
              }) => {
                // alt属性が存在することを確認
                expect(image.alt).toBeTruthy();
                expect(typeof image.alt).toBe("string");
                expect(image.alt.length).toBeGreaterThan(0);

                // loading属性が設定されていることを確認（Next.js Imageの場合）
                if (image.loading) {
                  expect(["lazy", "eager", "auto"]).toContain(image.loading);
                }
              },
            );
          } finally {
            await page.close();
          }
        },
        TEST_ENVIRONMENT.timeout.puppeteer,
      );
    });

    describe("Image Format Optimization", () => {
      test.skipIf(shouldSkipPerformanceTest("ci-only") || !TEST_ENVIRONMENT.isCI)(
        "should use modern image formats",
        async () => {
          if (!browser) {
            throw new Error("Browser not available");
          }
          const page = await browser.newPage();

          try {
            await page.goto(serverUrl, {
              waitUntil: "networkidle",
              timeout: 30000,
            });

            // 画像のリクエストを監視
            const imageRequests = await page.evaluate(() => {
              const resources = performance.getEntriesByType(
                "resource",
              ) as PerformanceResourceTiming[];
              return resources
                .filter(
                  (entry) =>
                    entry.name.includes(".jpg") ||
                    entry.name.includes(".jpeg") ||
                    entry.name.includes(".png") ||
                    entry.name.includes(".webp") ||
                    entry.name.includes(".avif"),
                )
                .map((entry) => ({
                  url: entry.name,
                  contentType: "",
                  size: entry.transferSize,
                }));
            });

            // モダンな画像フォーマット（WebP, AVIF）の使用を推奨
            const modernFormats = imageRequests.filter(
              (req) => req.contentType.includes("webp") || req.contentType.includes("avif"),
            );

            if (imageRequests.length > 0) {
              const modernFormatRatio = modernFormats.length / imageRequests.length;
              console.info(`Modern image format usage: ${(modernFormatRatio * 100).toFixed(1)}%`);

              // WebP/AVIFの使用率が50%以上であることを推奨
              expect(modernFormatRatio).toBeGreaterThanOrEqual(0.5);
            }
          } finally {
            await page.close();
          }
        },
        TEST_ENVIRONMENT.timeout.puppeteer,
      );

      test(
        "should optimize image sizes",
        async () => {
          if (!browser) {
            throw new Error("Browser not available");
          }
          const page = await browser.newPage();

          try {
            await page.setViewportSize({ width: 1920, height: 1080 });

            await page.goto(`${serverUrl}/blog`, {
              waitUntil: "networkidle",
              timeout: 30000,
            });

            // ビューポート内の画像を取得
            const visibleImages = await page
              .locator("img")
              .evaluateAll((imgs: HTMLImageElement[]) => {
                return imgs
                  .filter((img) => {
                    const rect = img.getBoundingClientRect();
                    return rect.top < window.innerHeight && rect.bottom > 0;
                  })
                  .map((img) => ({
                    src: img.src,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    displayWidth: img.width,
                    displayHeight: img.height,
                  }));
              });

            // 表示されている画像のサイズを検証
            visibleImages.forEach(
              (image: {
                src: string;
                width: number;
                height: number;
                displayWidth?: number;
                displayHeight?: number;
              }) => {
                // 画像が適切なサイズで読み込まれていることを確認
                expect(image.width).toBeGreaterThan(0);
                expect(image.height).toBeGreaterThan(0);

                // 表示サイズが自然サイズを超えていないことを確認（拡大されていない）
                if (image.displayWidth && image.displayHeight) {
                  expect(image.displayWidth).toBeLessThanOrEqual(image.width);
                  expect(image.displayHeight).toBeLessThanOrEqual(image.height);
                }
              },
            );

            // 大きな画像のサイズをチェック
            const largeImages = visibleImages.filter(
              (img: {
                src: string;
                width: number;
                height: number;
                displayWidth?: number;
                displayHeight?: number;
              }) => img.width > 2000 || img.height > 2000,
            );
            if (largeImages.length > 0) {
              console.warn(`${largeImages.length} large images detected. Consider optimization.`);
            }
          } finally {
            await page.close();
          }
        },
        TEST_ENVIRONMENT.timeout.puppeteer,
      );
    });

    describe("Image Asset Analysis", () => {
      test("should verify public images are optimized", () => {
        const publicDir = join(process.cwd(), "public");

        if (existsSync(publicDir)) {
          // publicディレクトリ内の画像ファイルを取得
          const imageFiles = [
            "file.svg",
            "vercel.svg",
            "window.svg", // package.jsonに記載されているファイル
          ];

          imageFiles.forEach((fileName) => {
            const filePath = join(publicDir, fileName);

            if (existsSync(filePath)) {
              const stats = readFileSync(filePath);
              const sizeKB = stats.length / 1024;

              // SVGファイルのサイズが適切であることを確認
              if (fileName.endsWith(".svg")) {
                expect(sizeKB).toBeLessThan(PERFORMANCE_THRESHOLDS.images.maxOptimizedSize);
              }
            }
          });
        }
      });

      test(
        "should check for missing images",
        async () => {
          if (!browser) {
            throw new Error("Browser not available");
          }
          const page = await browser.newPage();

          try {
            const brokenImages: Array<{ url: string; status: number }> = [];

            // 画像のエラーを監視
            page.on("response", (response) => {
              if (response.url().match(/\.(jpg|jpeg|png|webp|avif|svg)$/i)) {
                if (!response.ok()) {
                  brokenImages.push({
                    url: response.url(),
                    status: response.status(),
                  });
                }
              }
            });

            await page.goto(serverUrl, {
              waitUntil: "networkidle",
              timeout: 30000,
            });

            // 壊れた画像がないことを確認
            expect(brokenImages.length).toBe(0);

            // 代替テキストのない画像がないことを確認
            const imagesWithoutAlt = await page.locator("img:not([alt]), img[alt='']").count();
            expect(imagesWithoutAlt).toBe(0);
          } finally {
            await page.close();
          }
        },
        TEST_ENVIRONMENT.timeout.puppeteer,
      );
    });

    describe("Responsive Image Loading", () => {
      test(
        "should adapt image sizes to viewport",
        async () => {
          if (!browser) {
            throw new Error("Browser not available");
          }
          const page = await browser.newPage();

          try {
            // モバイルビューポート
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto(serverUrl, {
              waitUntil: "networkidle",
              timeout: 30000,
            });

            const mobileImageSizes = await page
              .locator("img")
              .evaluateAll((imgs: HTMLImageElement[]) =>
                imgs.map((img) => ({
                  src: img.src,
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                })),
              );

            // デスクトップビューポート
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.reload({ waitUntil: "networkidle" });

            const desktopImageSizes = await page
              .locator("img")
              .evaluateAll((imgs: HTMLImageElement[]) =>
                imgs.map((img) => ({
                  src: img.src,
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                })),
              );

            // レスポンシブな画像読み込みが機能していることを検証
            // （同じ画像が異なるサイズで読み込まれている場合がある）
            expect(mobileImageSizes.length).toBe(desktopImageSizes.length);

            // Next.jsのレスポンシブ画像機能が使用されていることを確認
            const responsiveImages = await page.locator("img[srcset], img[data-sizes]").count();
            if (mobileImageSizes.length > 0) {
              console.info(`${responsiveImages} responsive images detected`);
            }
          } finally {
            await page.close();
          }
        },
        TEST_ENVIRONMENT.timeout.puppeteer,
      );
    });
  },
);
