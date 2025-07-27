# React Scan 導入ガイド

## 概要

React
Scanは、Reactアプリケーションのパフォーマンス問題を検出し、遅いレンダリングを排除するための開発ツールです。このプロジェクトでは、ViteプラグインとCDNスクリプトの組み合わせで開発環境でのみ有効になるように設定されています。

## 導入方法

### 1. Viteプラグインの使用

このプロジェクトでは、`@react-scan/vite-plugin-react-scan`を使用してReact
Scanを統合しています。

```typescript
// vite.config.ts
import reactScan from "@react-scan/vite-plugin-react-scan";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    reactScan({
      enable: process.env.NODE_ENV === "development",
      autoDisplayNames: true,
      scanOptions: {
        enabled: process.env.NODE_ENV === "development",
        showToolbar: true,
        animationSpeed: "fast",
        trackUnnecessaryRenders: true,
        log: false,
      },
    }),
  ],
});
```

### 2. CDNスクリプトの追加

HTMLファイルにCDNスクリプトを追加して、確実にReact
Scanが動作するようにしています。

```html
<!-- index.html -->
<head>
  <script src="https://unpkg.com/react-scan/dist/auto.global.js"></script>
</head>
```

## 機能

### 1. レンダリングアウトライン

- コンポーネントがレンダリングされる際にアウトラインが表示されます
- 不要なレンダリングはグレーアウトで表示されます

### 2. レンダリング原因の調査

- ツールバーの左端のアイコンをクリックして、コンポーネントをクリック
- どのprops、state、contextが変更されたかを確認できます

### 3. パフォーマンスプロファイリング

- 通知ベルアイコンからプロファイラーにアクセス
- FPS低下や遅いインタラクションを検出
- コンポーネントのレンダリング時間をランキング表示

## 使用方法

### 開発環境での起動

```bash
bun run dev
```

開発環境でアプリケーションを起動すると、画面の右下にReact
Scanのツールバーが表示されます。

### ツールバーの機能

1. **レンダリングアウトラインの切り替え**
   - アウトラインの表示/非表示を切り替え
   - 設定はページリロード後も保持されます

2. **レンダリング原因の調査**
   - 左端のアイコンをクリック
   - 調査したいコンポーネントをクリック
   - 変更されたprops、state、contextを確認

3. **パフォーマンスプロファイリング**
   - 通知ベルアイコンをクリック
   - パフォーマンス問題の詳細を確認

4. **ツールバーの非表示**
   - ツールバーを画面の端にドラッグ
   - 折りたたまれた状態で保持されます

## 設定

### 環境変数

- `NODE_ENV=development`: 開発環境でのみ有効
- `E2E_TEST=true`: E2Eテスト時は無効

### Viteプラグイン設定

```typescript
reactScan({
  enable: process.env.NODE_ENV === "development",
  autoDisplayNames: true,
  scanOptions: {
    enabled: process.env.NODE_ENV === "development",
    showToolbar: true,
    animationSpeed: "fast",
    trackUnnecessaryRenders: true,
    log: false,
  },
});
```

## パフォーマンス最適化のヒント

### 1. 不要なレンダリングの特定

- グレーアウトされたアウトラインを確認
- 変更されていないpropsでレンダリングされているコンポーネントを特定

### 2. パフォーマンス問題の解決

- プロファイラーで遅いコンポーネントを特定
- `React.memo`、`useMemo`、`useCallback`の適切な使用
- オブジェクトや関数の再作成を避ける

### 3. 最適化のベストプラクティス

- 状態の局所化（State Colocation）
- 不要なグローバル状態の回避
- コンポーネントの責任を明確に分離

## トラブルシューティング

### ツールバーが表示されない

1. 開発環境で実行されているか確認
2. ブラウザのコンソールでエラーを確認
3. Viteプラグインが正しく設定されているか確認
4. CDNスクリプトが読み込まれているか確認

### パフォーマンスが低下する

1. `log: false`に設定されているか確認
2. 不要な機能を無効にする
3. プロダクション環境では無効になっているか確認

### Viteプラグインの問題

1. `@react-scan/vite-plugin-react-scan`がインストールされているか確認
2. `vite.config.ts`でプラグインが正しく設定されているか確認
3. 開発サーバーを再起動

## 参考リンク

- [React Scan GitHub](https://github.com/aidenybai/react-scan)
- [React Scan 公式サイト](https://react-scan.com)
- [React パフォーマンス最適化ガイド](https://react.dev/learn/render-and-commit)
- [Viteプラグイン ドキュメント](https://github.com/aidenybai/react-scan/tree/main/packages/vite-plugin-react-scan)

## 注意事項

- プロダクション環境では自動的に無効になります
- E2Eテスト時は無効になります
- パフォーマンスに影響を与える可能性があるため、必要に応じて機能を無効にしてください
- ViteプラグインとCDNスクリプトの両方を使用することで、確実に動作するようになっています
