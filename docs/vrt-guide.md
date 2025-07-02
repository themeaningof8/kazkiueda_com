# Visual Regression Testing (VRT) ガイド

このプロジェクトでは、UI コンポーネントの視覚的回帰を検出するために Lost Pixel
を使用しています。

## 概要

### VRT ツール構成

- **Lost Pixel**: Storybook コンポーネントの視覚的回帰テスト
- **Playwright**: E2E テストとページレベルの視覚的テスト

この分離により、それぞれのツールの強みを活かし、包括的なテストカバレッジを実現しています。

## セットアップ

### 初回セットアップ

```bash
# 依存関係のインストール
bun install

# Storybook のビルド
bun run build-storybook

# 初回ベースライン画像の生成
bun run test:vrt:update
```

## 使用方法

### 基本的なワークフロー

1. **新しいコンポーネントの作成**
   ```bash
   # コンポーネントと Story を作成
   # 例: src/components/ui/NewComponent/
   ```

2. **ベースライン画像の生成**
   ```bash
   bun run test:vrt:update
   ```

3. **VRT の実行**
   ```bash
   bun run test:vrt
   ```

### 利用可能なコマンド

```bash
# VRT の実行（差分があると失敗）
bun run test:vrt

# ベースライン画像の更新
bun run test:vrt:update

# 現在の差分を承認してベースライン更新
bun run test:vrt:approve

# CI モード（--fail-on-difference フラグ付き）
bun run test:vrt:ci
```

## 開発ワークフロー

### 新しいコンポーネントの追加

1. コンポーネントと対応する Story を作成
2. Storybook で表示を確認
3. ベースライン画像を生成: `bun run test:vrt:update`
4. コミット時にベースライン画像も含める

### 既存コンポーネントの変更

1. コンポーネントを変更
2. VRT を実行: `bun run test:vrt`
3. 差分が検出された場合：
   - 意図的な変更 → `bun run test:vrt:approve`
   - 意図しない変更 → コンポーネントを修正

### プルリクエスト時

GitHub Actions が自動的に：

1. Storybook をビルド
2. VRT を実行
3. 差分が見つかった場合、PR にコメントで通知
4. 差分画像を Artifacts としてアップロード

## トラブルシューティング

### よくある問題

#### 1. フォント読み込みの不安定性

```javascript
// lostpixel.config.js の beforeScreenshot で対処済み
await page.evaluate(() => document.fonts.ready);
```

#### 2. アニメーションによる不安定性

```javascript
// CSS アニメーションを無効化（設定済み）
animation-duration: 1ms !important;
```

#### 3. タイムスタンプなど動的コンテンツ

```javascript
// マスク機能を使用
mask: [
  {
    selector: '[data-testid="dynamic-timestamp"]',
  },
],
```

### デバッグ方法

1. **Storybook で確認**
   ```bash
   bun run storybook
   ```

2. **差分画像の確認**
   - `lost-pixel-difference/` フォルダ内の画像を確認
   - 期待値と実際の値を比較

3. **Lost Pixel の詳細ログ**
   ```bash
   DEBUG=lost-pixel* bun run test:vrt
   ```

## ベストプラクティス

### Story の作成

```typescript
// 安定したスクリーンショットのための推奨設定
export const Default: Story = {
  args: {
    // 固定値を使用（Math.random() や Date.now() は避ける）
    timestamp: "2024-01-01T00:00:00Z",
  },
  parameters: {
    // アニメーションを無効化
    chromatic: { disableSnapshot: false },
  },
};
```

### 動的コンテンツの処理

```typescript
// テストID を使用して動的部分をマーク
<div data-testid="dynamic-timestamp">
  {new Date().toISOString()}
</div>;
```

### パフォーマンス最適化

- 必要な Story のみをテスト対象にする
- 複雑なインタラクションは E2E テストに委譲
- 大きなデータセットは避け、代表的なケースに絞る

## CI/CD 統合

### GitHub Actions

`.github/workflows/visual-regression.yml` で以下を自動化：

- PR 作成時の VRT 実行
- 差分検出時の自動コメント
- アーティファクトとして差分画像を保存

### ローカル開発

```bash
# 開発中の継続的なチェック
bun run test:vrt --watch
```

## 設定ファイル

### lostpixel.config.js

主要な設定項目：

```javascript
{
  mode: 'storybook',           // Storybook モード
  threshold: 0.2,              // 許容差異（0.2%）
  browsers: ['chromium'],      // テスト対象ブラウザ
  shotMode: 'fullPage',        // フルページスクリーンショット
}
```

## サポート

問題が発生した場合：

1. この文書のトラブルシューティングを確認
2. [Lost Pixel 公式ドキュメント](https://docs.lost-pixel.com/) を参照
3. プロジェクトの Issue を作成
