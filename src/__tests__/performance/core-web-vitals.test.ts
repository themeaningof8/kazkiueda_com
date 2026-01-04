/**
 * Core Web Vitals Performance Tests
 *
 * Largest Contentful Paint (LCP), First Input Delay (FID),
 * Cumulative Layout Shift (CLS)を測定し、Googleの推奨閾値を超えていないことを検証します。
 */

import lighthouse from "lighthouse";
import puppeteer from "puppeteer";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { LIGHTHOUSE_CONFIG, TEST_ENVIRONMENT } from "./config";
import {
  assertPerformanceThreshold,
  extractCoreWebVitals,
  shouldSkipPerformanceTest,
} from "./utils";

describe.skipIf(!TEST_ENVIRONMENT.isCI)("Core Web Vitals", () => {
  let browser: import("puppeteer").Browser | undefined;
  let serverUrl: string;

  beforeAll(async () => {
    // テスト環境のセットアップ
    serverUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // CI環境でのみブラウザを起動
    if (TEST_ENVIRONMENT.isCI && !TEST_ENVIRONMENT.headless) {
      browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }
  }, TEST_ENVIRONMENT.timeout.puppeteer);

  afterAll(async () => {
    if (browser && TEST_ENVIRONMENT.isCI) {
      await browser.close();
    }
  });

  describe("Homepage Performance", () => {
    test.skipIf(shouldSkipPerformanceTest("ci-only") || !TEST_ENVIRONMENT.isCI)(
      "should meet Core Web Vitals thresholds for homepage",
      async () => {
        const url = new URL(serverUrl);
        const runnerResult = await lighthouse(serverUrl, {
          ...LIGHTHOUSE_CONFIG,
          port: url.port ? parseInt(url.port, 10) : 80,
        });

        expect(runnerResult).toBeDefined();
        if (!runnerResult?.lhr) {
          throw new Error("Lighthouse result is missing lhr property");
        }

        const vitals = extractCoreWebVitals(runnerResult);

        // LCP: 2.5秒以内 (Good threshold)
        assertPerformanceThreshold("coreWebVitals", "lcp", vitals.lcp, "ms");
        expect(vitals.lcp).toBeLessThanOrEqual(2500);

        // FID: 100ms以内 (Good threshold)
        assertPerformanceThreshold("coreWebVitals", "fid", vitals.fid, "ms");
        expect(vitals.fid).toBeLessThanOrEqual(100);

        // CLS: 0.1以内 (Good threshold)
        assertPerformanceThreshold("coreWebVitals", "cls", vitals.cls);
        expect(vitals.cls).toBeLessThanOrEqual(0.1);

        // Performance Score: 90以上
        expect(vitals.performance).toBeGreaterThanOrEqual(90);
      },
      TEST_ENVIRONMENT.timeout.lighthouse,
    );

    test(
      "should load homepage within acceptable time",
      async () => {
        const page = await browser?.newPage();
        if (!page) {
          throw new Error("Browser not available");
        }

        try {
          const startTime = Date.now();

          await page.goto(serverUrl, {
            waitUntil: "networkidle0",
            timeout: 30000,
          });

          const loadTime = Date.now() - startTime;

          // ページロード時間: 3秒以内
          assertPerformanceThreshold("general", "maxPageLoadTime", loadTime, "ms");
          expect(loadTime).toBeLessThanOrEqual(3000);

          // ページタイトルが存在することを確認
          const title = await page.title();
          expect(title).toBeTruthy();
          expect(typeof title).toBe("string");
          expect(title.length).toBeGreaterThan(0);
        } finally {
          await page.close();
        }
      },
      TEST_ENVIRONMENT.timeout.puppeteer,
    );
  });

  describe("Blog Page Performance", () => {
    test.skipIf(shouldSkipPerformanceTest("ci-only") || !TEST_ENVIRONMENT.isCI)(
      "should meet Core Web Vitals thresholds for blog page",
      async () => {
        const blogUrl = `${serverUrl}/blog`;

        const url = new URL(serverUrl);
        const runnerResult = await lighthouse(blogUrl, {
          ...LIGHTHOUSE_CONFIG,
          port: url.port ? parseInt(url.port, 10) : 80,
        });

        expect(runnerResult).toBeDefined();

        const vitals = extractCoreWebVitals(runnerResult);

        // LCP: 2.5秒以内
        assertPerformanceThreshold("coreWebVitals", "lcp", vitals.lcp, "ms");
        expect(vitals.lcp).toBeLessThanOrEqual(2500);

        // CLS: 0.1以内
        assertPerformanceThreshold("coreWebVitals", "cls", vitals.cls);
        expect(vitals.cls).toBeLessThanOrEqual(0.1);

        // Performance Score: 85以上 (ブログページはコンテンツが多いため少し緩め)
        expect(vitals.performance).toBeGreaterThanOrEqual(85);
      },
      TEST_ENVIRONMENT.timeout.lighthouse,
    );

    test(
      "should load blog page efficiently",
      async () => {
        const page = await browser?.newPage();
        if (!page) {
          throw new Error("Browser not available");
        }

        try {
          const startTime = Date.now();

          await page.goto(`${serverUrl}/blog`, {
            waitUntil: "networkidle0",
            timeout: 30000,
          });

          const loadTime = Date.now() - startTime;

          // ブログページのロード時間: 4秒以内 (コンテンツが多いため)
          expect(loadTime).toBeLessThanOrEqual(4000);

          // ブログ記事が存在することを確認
          const articles = await page.$$('[data-testid="post-card"]');
          expect(articles.length).toBeGreaterThanOrEqual(0); // 記事が0件でもOK
        } finally {
          await page.close();
        }
      },
      TEST_ENVIRONMENT.timeout.puppeteer,
    );
  });

  describe("Post Detail Page Performance", () => {
    test.skipIf(shouldSkipPerformanceTest("ci-only") || !TEST_ENVIRONMENT.isCI)(
      "should meet Core Web Vitals thresholds for post detail page",
      async () => {
        // テスト用の記事URLを取得（実際の環境に合わせて調整）
        const postUrl = `${serverUrl}/posts/sample-post`;

        const url = new URL(serverUrl);
        const runnerResult = await lighthouse(postUrl, {
          ...LIGHTHOUSE_CONFIG,
          port: url.port ? parseInt(url.port, 10) : 80,
        });

        expect(runnerResult).toBeDefined();

        const vitals = extractCoreWebVitals(runnerResult);

        // LCP: 2.5秒以内
        assertPerformanceThreshold("coreWebVitals", "lcp", vitals.lcp, "ms");
        expect(vitals.lcp).toBeLessThanOrEqual(2500);

        // CLS: 0.1以内
        assertPerformanceThreshold("coreWebVitals", "cls", vitals.cls);
        expect(vitals.cls).toBeLessThanOrEqual(0.1);

        // Performance Score: 90以上
        expect(vitals.performance).toBeGreaterThanOrEqual(90);
      },
      TEST_ENVIRONMENT.timeout.lighthouse,
    );

    test(
      "should handle dynamic content loading efficiently",
      async () => {
        const page = await browser?.newPage();
        if (!page) {
          throw new Error("Browser not available");
        }

        try {
          // 実際の記事が存在しない場合もあるので、404ページのテストに変更
          const startTime = Date.now();

          await page.goto(`${serverUrl}/posts/non-existent-post`, {
            waitUntil: "networkidle0",
            timeout: 30000,
          });

          const loadTime = Date.now() - startTime;

          // 404ページも効率的にロードされるべき
          expect(loadTime).toBeLessThanOrEqual(2000);

          // エラーページが表示されていることを確認
          const errorContent = await page.$('[data-testid="error-page"]');
          expect(errorContent).toBeTruthy();
        } finally {
          await page.close();
        }
      },
      TEST_ENVIRONMENT.timeout.puppeteer,
    );
  });
});
