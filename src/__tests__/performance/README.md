# Performance Tests Layer

Testing Trophyの最上位層として、アプリケーションのパフォーマンス品質を確保するためのテストスイートです。

## 概要

Performance Tests層は以下の側面をカバーします：

- **Core Web Vitals**: LCP, FID, CLSの測定と監視
- **Bundle Size**: JavaScriptバンドルのサイズ監視
- **Memory Leaks**: メモリリークの検出と防止
- **Image Optimization**: 画像の最適化とロードパフォーマンス

## 実行方法

### ローカル実行

```bash
# 基本的なパフォーマンステスト
bun run test:performance

# CI環境向けのエッセンシャルテスト
bun run test:performance:essential

# 詳細なレポートを含むフルテスト
bun run test:performance:full
```

### CI環境での実行

CIパイプラインでは自動的に実行されます：

```yaml
# .github/workflows/ci.yml
- name: Performance Tests
  needs: integration
  uses: ./.github/workflows/reusable-tests.yml
  with:
    suite: performance
```

## テスト構成

### Core Web Vitals (`core-web-vitals.test.ts`)

Lighthouseを使用して主要ページのCore Web Vitalsを測定：

- **Largest Contentful Paint (LCP)**: 2.5秒以内
- **First Input Delay (FID)**: 100ms以内
- **Cumulative Layout Shift (CLS)**: 0.1以内

### Bundle Size (`bundle-size.test.ts`)

JavaScriptバンドルのサイズと構成を分析：

- バンドルサイズの制限チェック
- 依存関係の分析
- コード分割の検証

### Memory Leak Detection (`memory-leak.test.ts`)

メモリリークを検出：

- ブラウザメモリ使用量の監視
- ページナビゲーション時のメモリ増加チェック
- コンポーネントのアンマウント時のクリーンアップ検証

### Image Optimization (`image-optimization.test.ts`)

画像パフォーマンスを最適化：

- 画像ロード時間の測定
- フォーマット最適化の検証（WebP, AVIF）
- Next.js Imageコンポーネントの使用確認

## 設定

### パフォーマンス閾値

`config.ts`で各テストの閾値を設定：

```typescript
export const PERFORMANCE_THRESHOLDS = {
  coreWebVitals: {
    lcp: 2500,    // LCP: 2.5秒
    fid: 100,     // FID: 100ms
    cls: 0.1,     // CLS: 0.1
  },
  bundleSize: {
    maxSize: 500,        // バンドルサイズ: 500KB
    maxChunkSize: 200,   // チャンクサイズ: 200KB
  },
  memory: {
    leakThreshold: 50,   // メモリリーク閾値: 50MB
    maxHeapUsage: 100,   // 最大ヒープ使用量: 100MB
  },
  // ...
};
```

### テスト環境設定

環境に応じたテスト実行：

```typescript
export const TEST_ENVIRONMENT = {
  isLocal: process.env.NODE_ENV === "development",
  isCI: process.env.CI === "true",
  headless: process.env.CI === "true" || process.env.HEADLESS === "true",
  timeout: {
    lighthouse: 60000,
    puppeteer: 30000,
    bundleAnalysis: 10000,
  },
};
```

## 依存関係

Performance Tests層で使用する主な依存関係：

- `lighthouse`: Core Web Vitals測定
- `puppeteer`: ブラウザ自動化とメモリ分析
- `bundlesize`: バンドルサイズ監視
- `memlab`: メモリリーク検出

## テストのスキップ条件

CI環境やローカル環境に応じてテストをスキップ：

```typescript
// CI環境でのみ実行
test.skipIf(shouldSkipPerformanceTest("ci-only"))(
  "heavy performance test",
  async () => { /* ... */ }
);

// 重いテストをローカルでスキップ
test.skipIf(shouldSkipPerformanceTest("heavy"))(
  "memory leak detection",
  async () => { /* ... */ }
);
```

## パフォーマンス回帰の検出

定期的なパフォーマンステストにより：

1. **バンドルサイズの増加**を早期検出
2. **Core Web Vitalsの低下**を防止
3. **メモリリーク**を防ぐ
4. **画像最適化**の効果を維持

これにより、アプリケーションのパフォーマンス品質を継続的に維持できます。