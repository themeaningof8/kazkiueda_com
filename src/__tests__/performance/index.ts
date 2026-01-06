/**
 * Performance Tests Layer - Testing Trophy
 *
 * この層はアプリケーションのパフォーマンス品質を確保するためのテストを提供します。
 * Testing Trophyの最上位層として、以下の側面をカバーします：
 *
 * - Bundle Size: JavaScriptバンドルのサイズ監視
 * - Memory Leaks: メモリリークの検出と防止
 * - Image Optimization: 画像の最適化とロードパフォーマンス
 *
 * Core Web VitalsテストはE2E Essentialに統合されました。
 * これらのテストはCI/CDパイプラインに統合され、
 * パフォーマンス回帰を早期に検出します。
 */

// knip: ignore

export * from "./bundle-size.test";
export * from "./image-optimization.test";
export * from "./memory-leak.test";
