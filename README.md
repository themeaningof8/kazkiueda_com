This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

このプロジェクトは **Bun** をパッケージマネージャーとして使用しています。

### 必要な環境

- [Bun](https://bun.sh) 1.3.5以上

### セットアップ

依存関係をインストール：

```bash
bun install
```

環境変数を設定：

`projects/.env` ファイルを作成し、以下の環境変数を設定してください：

```env
# データベース（必須）
DATABASE_URL=your-database-url

# Payload CMS（必須）
PAYLOAD_SECRET=your-secret-key

# プレビューシークレット（必須）
PAYLOAD_PREVIEW_SECRET=your-preview-secret

# サイトURL（プレビュー機能に使用、オプション）
# 開発環境では通常設定不要（デフォルトでhttp://localhost:3000が使用されます）
# 本番環境では公開URLを設定してください
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Vercel（Vercelにデプロイする場合、自動的に設定されます）
# 通常は手動で設定する必要はありません
# VERCEL_URL=your-project.vercel.app

# Cloudflare R2（オプション - 設定しない場合はローカルストレージを使用）
# すべてのR2環境変数を設定するか、すべて未設定にするかのどちらかです
# 一部のみ設定すると警告が表示され、ローカルストレージが使用されます
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
```

**環境変数の説明：**

- `DATABASE_URL`: PostgreSQLデータベースの接続文字列（必須）
- `PAYLOAD_SECRET`: Payload CMSの暗号化キー（必須、本番環境では安全なランダム文字列を使用）
- `PAYLOAD_PREVIEW_SECRET`: 管理画面からのプレビューを許可するためのシークレット文字列（必須）
- `NEXT_PUBLIC_SITE_URL`: サイトの公開URL（プレビュー機能で使用、開発環境では通常設定不要）
- `VERCEL_URL`: Vercelにデプロイする場合、自動的に設定されます（手動設定不要）

**Cloudflare R2の設定について：**

- R2の環境変数が**すべて**設定されている場合、メディアファイルはR2に保存されます
- 環境変数が設定されていない場合、ローカルストレージ（`media`ディレクトリ）が使用されます
- 一部のみ設定すると警告が表示され、ローカルストレージが使用されます
- R2の設定方法：
  1. CloudflareダッシュボードでR2バケットを作成
  2. R2 APIトークンを作成（読み書き権限が必要）
  3. エンドポイントURLは `https://<account-id>.r2.cloudflarestorage.com` の形式
  4. 上記の環境変数を**すべて**設定
  5. R2バケットのCORS設定で、必要に応じて公開アクセスを許可

**データベース接続プール設定：**

PostgreSQLの接続プール設定は、`DATABASE_URL`のクエリパラメータで設定できます：

```
DATABASE_URL=postgresql://user:password@host:5432/dbname?connection_limit=10&pool_timeout=20
```

**プレビュー/開発環境設定：**

```
# プレビュー機能用サイトURL
# 開発環境では通常設定不要（デフォルトでhttp://localhost:3000が使用されます）
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Vercelデプロイ時のURL（自動設定されるため通常手動設定不要）
# VERCEL_URL=your-project.vercel.app
```

開発サーバーを起動：

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
