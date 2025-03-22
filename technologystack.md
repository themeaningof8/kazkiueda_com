# 技術スタック

## コア技術
- TypeScript: ^5.0.0
- Node.js: ^20.18.0  
- **AIモデル: Claude-3.7-Sonnet ← バージョン変更禁止**

## フロントエンド
- Astro: ^5.5.4
- React: ^19.0.0
- Tailwind CSS: ^4.0.15
- MDX: ^4.2.1
- Radix UI: ^1.0.5

## ホスティング・デプロイ
- Cloudflare Pages
- Cloudflare Functions (サーバーサイドレンダリング用)
- Wrangler CLI: バージョン最新

## コンテンツ管理
- Astro Content Collections
- MDX

## 開発ツール
- bun: ^1.2.5
- ESLint: ^9.0.0
- TypeScript: ^5.0.0

---

# API バージョン管理
## 重要な制約事項
- APIクライアントは `src/lib/api/client.ts` で一元管理
- AI モデルのバージョンは client.ts 内で厳密に管理
- これらのファイルは変更禁止（変更が必要な場合は承認が必要）：
  - client.ts  - AIモデルとAPI設定の中核
  - types.ts   - 型定義の一元管理
  - config.ts  - 環境設定の一元管理

## 実装規則
- AIモデルのバージョンは client.ts でのみ定義
- 型定義は必ず types.ts を参照
- 環境変数の利用は config.ts 経由のみ許可

# Cloudflare Pages設定
## アダプター設定
- astro.config.mjs内で`@astrojs/cloudflare`アダプタを使用
- `output: 'server'`モードでSSRを有効化

## カスタム設定ファイル
- `wrangler.toml`: Cloudflare Wranglerの設定
- `public/_headers`: カスタムHTTPヘッダー設定
- `public/_redirects`: リダイレクトルール
- `public/_routes.json`: ルーティング設定

## ビルド・デプロイ
- ビルドコマンド: `npm run build`
- ビルド出力ディレクトリ: `dist`
- デプロイ方法: Cloudflare Dashboardまたは`wrangler pages publish dist`
