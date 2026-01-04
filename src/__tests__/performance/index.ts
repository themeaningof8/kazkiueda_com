/**
 * Performance Tests Layer - Testing Trophy
 *
 * この層はアプリケーションのパフォーマンス品質を確保するためのテストを提供します。
 * Testing Trophyの最上位層として、以下の側面をカバーします：
 *
 * - Core Web Vitals: LCP, FID, CLSの測定と監視
 * - Bundle Size: JavaScriptバンドルのサイズ監視
 * - Memory Leaks: メモリリークの検出と防止
 * - Image Optimization: 画像の最適化とロードパフォーマンス
 *
 * これらのテストはCI/CDパイプラインに統合され、
 * パフォーマンス回帰を早期に検出します。
 */

export * from "./bundle-size.test";
export * from "./core-web-vitals.test";
export * from "./image-optimization.test";
export * from "./memory-leak.test";
