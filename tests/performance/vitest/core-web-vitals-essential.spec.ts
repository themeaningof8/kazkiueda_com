import { chromium } from "playwright";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { PERFORMANCE_THRESHOLDS, TEST_ENVIRONMENT } from "../../../src/lib/performance/config";

/**
 * LayoutShift entry type for Cumulative Layout Shift (CLS) measurement
 */
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

/**
 * Core Web Vitals Essential Tests
 *
 * E2E Essentialテストに含める軽量なCore Web Vitalsチェック
 * 主要ページの基本的なパフォーマンス指標を検証
 */
describe.skipIf(!TEST_ENVIRONMENT.isCI || !TEST_ENVIRONMENT.playwrightAvailable)(
  "Core Web Vitals - Essential",
  () => {
    let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;

    beforeAll(async () => {
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

    test("should load home page within acceptable time", async () => {
      if (!browser) return;

      const page = await browser.newPage();
      try {
        const startTime = Date.now();

        await page.goto("/");
        await page.waitForLoadState("networkidle");

        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(3000); // 3秒以内

        // LCP (Largest Contentful Paint) の基本チェック
        const lcp = await page.evaluate(() => {
          return new Promise<number>((resolve) => {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              resolve(lastEntry?.startTime || 0);
            });
            observer.observe({ entryTypes: ["largest-contentful-paint"] });

            // フォールバック: 3秒後にデフォルト値
            setTimeout(() => resolve(0), 3000);
          });
        });

        if (lcp > 0) {
          expect(lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.coreWebVitals.lcp); // LCP 2.5秒以内 (Good)
        }
      } finally {
        await page.close();
      }
    });

    test("should have acceptable First Contentful Paint", async () => {
      if (!browser) return;

      const page = await browser.newPage();
      try {
        await page.goto("/");

        const fcp = await page.evaluate(() => {
          return new Promise<number>((resolve) => {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const fcpEntry = entries.find((entry) => entry.name === "first-contentful-paint");
              resolve(fcpEntry?.startTime || 0);
            });
            observer.observe({ entryTypes: ["paint"] });

            // フォールバック
            setTimeout(() => resolve(0), 2000);
          });
        });

        if (fcp > 0) {
          expect(fcp).toBeLessThan(1800); // FCP 1.8秒以内 (Good)
        }
      } finally {
        await page.close();
      }
    });

    test("should not have excessive layout shifts", async () => {
      if (!browser) return;

      const page = await browser.newPage();
      try {
        await page.goto("/");

        // CLS (Cumulative Layout Shift) の監視
        const cls = await page.evaluate(() => {
          return new Promise<number>((resolve) => {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                const layoutShiftEntry = entry as LayoutShift;
                if (!layoutShiftEntry.hadRecentInput) {
                  clsValue += layoutShiftEntry.value;
                }
              }
            });
            observer.observe({ entryTypes: ["layout-shift"] });

            // 2秒後に結果を返す
            setTimeout(() => resolve(clsValue), 2000);
          });
        });

        expect(cls).toBeLessThan(PERFORMANCE_THRESHOLDS.coreWebVitals.cls); // CLS 0.1以内 (Good)
      } finally {
        await page.close();
      }
    });
  },
);
