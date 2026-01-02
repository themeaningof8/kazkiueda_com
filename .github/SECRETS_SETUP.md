# GitHub Secrets 設定ガイド

このドキュメントは、CI/CDパイプラインで必要なGitHub Secretsの設定手順を説明します。

---

## 📋 必要なSecrets（dotenvxを入口に統一）

### テスト/CI用
| Secret名 | 用途 |
|----------|------|
| `DOTENV_PRIVATE_KEY_TEST` | `projects/.env.test` を復号（static/unit/integration/e2eで使用） |

### ステージング
| Secret名 | 用途 |
|----------|------|
| `VERCEL_TOKEN` | Vercelデプロイ（staging） |
| `VERCEL_ORG_ID` | 同上 |
| `VERCEL_PROJECT_ID` | 同上 |
| `DOTENV_PRIVATE_KEY_DEVELOPMENT` | （必要に応じて）`projects/.env.development` を復号 |

### 本番
| Secret名 | 用途 |
|----------|------|
| `DOTENV_PRIVATE_KEY_PRODUCTION` | `projects/.env.production` を復号 |
| `NEXT_PUBLIC_SERVER_URL` | Smoke用URL（例: https://kazkiueda.com） |
| `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` | Vercel本番デプロイ |
| `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_ENDPOINT` | メディアアップロード |

### オプション
| Secret名 | 用途 |
|----------|------|
| `CODECOV_TOKEN` | Codecovアップロード |
| `SLACK_WEBHOOK` | Nightly失敗通知など（未設定でも可） |

---

## 🚀 設定手順

### 1. GitHubリポジトリのSettings → Secrets and variables → Actions

1. GitHubリポジトリページを開く
2. 上部タブの **Settings** をクリック
3. 左サイドバーの **Secrets and variables** → **Actions** をクリック
4. **New repository secret** ボタンをクリック

### 2. テスト環境用Secretsの設定

以下のSecretsを順番に追加します：

#### `TEST_DATABASE_URL`

```
Name: TEST_DATABASE_URL
Secret: postgresql://test:test@localhost:5433/kazkiueda_test
```

**説明**: CI環境で起動するDocker PostgreSQLの接続文字列です。この値は固定で問題ありません。

---

#### `TEST_PAYLOAD_SECRET`

```
Name: TEST_PAYLOAD_SECRET
Secret: a123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
```

**説明**: Payload CMSの暗号化キー。最低32文字必要です。

**生成方法**:
```bash
# ランダムな128文字の文字列を生成
openssl rand -base64 96 | tr -d '\n'
```

または、現在の`.env.test`の値をそのまま使用:
```
a123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
```

---

#### `TEST_PAYLOAD_PREVIEW_SECRET`

```
Name: TEST_PAYLOAD_PREVIEW_SECRET
Secret: test-preview-secret-123456789012345678901234567890
```

**説明**: プレビュー機能のシークレット。

**生成方法**:
```bash
# ランダムな32文字の文字列を生成
openssl rand -base64 24 | tr -d '\n'
```

または、現在の`.env.test`の値をそのまま使用:
```
test-preview-secret-123456789012345678901234567890
```

---

### 3. Vercel連携用Secretsの設定（デプロイ機能を使う場合）

#### `VERCEL_TOKEN`の取得

1. [Vercel Dashboard](https://vercel.com/account/tokens) にアクセス
2. **Create Token** をクリック
3. Token名を入力（例: `github-actions-kazkiueda_com`）
4. スコープを選択（Full Accessを推奨）
5. 生成されたトークンをコピー
6. GitHub Secretsに追加

```
Name: VERCEL_TOKEN
Secret: [生成されたトークン]
```

#### `VERCEL_ORG_ID`と`VERCEL_PROJECT_ID`の取得

1. [Vercel Dashboard](https://vercel.com/) でプロジェクトを開く
2. **Settings** タブをクリック
3. **General** セクションで以下を確認:
   - **Project ID**: `prj_xxxxxxxxxxxxx`
   - **Team ID** (Organization ID): `team_xxxxxxxxxxxxx`

```
Name: VERCEL_ORG_ID
Secret: team_xxxxxxxxxxxxx
```

```
Name: VERCEL_PROJECT_ID
Secret: prj_xxxxxxxxxxxxx
```

---

### 4. プレビュー環境用Secretsの設定（PR Preview機能を使う場合）

プレビュー環境では、専用のデータベースが必要です。

#### オプション1: Supabase（推奨）

1. [Supabase](https://supabase.com/) で新しいプロジェクトを作成
2. **Settings** → **Database** → **Connection String** をコピー
3. GitHub Secretsに追加

```
Name: PREVIEW_DATABASE_URL
Secret: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### オプション2: Neon

1. [Neon](https://neon.tech/) で新しいプロジェクトを作成
2. 接続文字列をコピー
3. GitHub Secretsに追加

```
Name: PREVIEW_DATABASE_URL
Secret: postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]
```

#### プレビュー用Payload Secrets

```
Name: PREVIEW_PAYLOAD_SECRET
Secret: [ランダムな128文字の文字列]

Name: PREVIEW_PAYLOAD_PREVIEW_SECRET
Secret: [ランダムな32文字の文字列]
```

---

### 5. 本番環境用Secretsの設定（本番デプロイ機能を使う場合）

本番環境のSecretsは、実際の本番環境の値を設定します。

```
Name: PRODUCTION_DATABASE_URL
Secret: [本番PostgreSQL接続文字列]

Name: PRODUCTION_PAYLOAD_SECRET
Secret: [本番Payload CMSシークレット]

Name: PRODUCTION_PAYLOAD_PREVIEW_SECRET
Secret: [本番プレビューシークレット]

Name: NEXT_PUBLIC_SERVER_URL
Secret: https://kazkiueda.com

Name: S3_BUCKET
Secret: [S3バケット名]

Name: S3_ACCESS_KEY_ID
Secret: [S3アクセスキーID]

Name: S3_SECRET_ACCESS_KEY
Secret: [S3シークレットアクセスキー]

Name: S3_REGION
Secret: ap-northeast-1

Name: S3_ENDPOINT
Secret: [S3エンドポイント]
```

---

## ✅ 最小限セット
- CI/テスト: `DOTENV_PRIVATE_KEY_TEST`（.env.test にDB/シークレットを格納済み想定）
- Stagingデプロイ: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- 本番デプロイ: `DOTENV_PRIVATE_KEY_PRODUCTION`, `VERCEL_*`, `NEXT_PUBLIC_SERVER_URL`（+必要ならS3）

---

## 🔍 設定確認

### 手動トリガーでテスト

1. GitHubリポジトリの **Actions** タブを開く
2. 左サイドバーから **CI Pipeline** を選択
3. **Run workflow** ボタンをクリック
4. ブランチを選択して **Run workflow** を実行

### 設定が正しいか確認

ワークフローのログで以下を確認：

```
✅ Static Analysis - 成功
✅ Unit Tests - 成功
✅ Integration Tests - 成功
✅ E2E Tests - 成功
```

### よくあるエラー

#### エラー: `DATABASE_URL is not defined`

**原因**: `TEST_DATABASE_URL` Secretが設定されていない

**解決策**: 上記の手順に従って`TEST_DATABASE_URL`を追加

#### エラー: `PAYLOAD_SECRET must be at least 32 characters`

**原因**: `TEST_PAYLOAD_SECRET`が短すぎる

**解決策**: 最低32文字（推奨128文字）の文字列を設定

#### エラー: `Docker Compose failed to start`

**原因**: GitHub Actions runnerがDockerを起動できない

**解決策**: ワークフローの`runs-on: ubuntu-latest`を確認

---

## 📊 環境変数の優先順位

ワークフロー内での環境変数の優先順位：

1. **ジョブレベルのenv** （最優先）
2. **ステップレベルのenv**
3. **GitHub Secrets**
4. **リポジトリのEnvironment variables**

現在のワークフローでは、以下のように使用されています：

```yaml
# ci.yml の例
jobs:
  unit-tests:
    steps:
      - name: Run unit tests
        run: bun run test:coverage:unit
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}  # ← GitHub Secretsから取得
          PAYLOAD_SECRET: ${{ secrets.TEST_PAYLOAD_SECRET }}
```

---

## 🔐 セキュリティのベストプラクティス

### ✅ 推奨

1. **環境別にSecretsを分離**: TEST_, PREVIEW_, PRODUCTION_
2. **最小権限の原則**: 必要なSecretsのみ設定
3. **定期的なローテーション**: 本番Secretsは定期的に変更
4. **アクセス制限**: GitHub Organization/Team単位で管理

### ❌ 避けるべき

1. **同じSecretを複数環境で使い回す**: TEST_とPRODUCTION_は別の値を使用
2. **Secretsをログに出力**: `echo ${{ secrets.xxx }}`は絶対にしない
3. **Pull Requestからのアクセス**: forkからのPRはSecretsにアクセスできない仕様

---

## 🚨 トラブルシューティング

### Secret値が正しく読み込まれない

**確認1**: Secret名のスペルミス
```yaml
# ❌ 間違い
${{ secrets.TEST_DATABSE_URL }}  # DATABSE → DATABASE

# ✅ 正しい
${{ secrets.TEST_DATABASE_URL }}
```

**確認2**: Secretが設定されているか
- Settings → Secrets and variables → Actions で確認

**確認3**: ワークフローの再実行
- Secretsを追加/変更後は、ワークフローを再実行する必要があります

### GitHub ActionsログでSecretが `***` として表示される

**これは正常です**。GitHub ActionsはSecret値を自動的にマスクします。

```
# ログの例
DATABASE_URL: postgresql://test:***@localhost:5433/kazkiueda_test
                                ^^^
                             マスクされる
```

---

## 📝 チェックリスト

### E2Eテスト実行に必要な設定

- [ ] `TEST_DATABASE_URL` を追加
- [ ] `TEST_PAYLOAD_SECRET` を追加（最低32文字）
- [ ] `TEST_PAYLOAD_PREVIEW_SECRET` を追加
- [ ] GitHub Actions タブで手動実行してテスト
- [ ] CI Pipeline が成功することを確認

### PR Preview機能を使う場合（追加）

- [ ] `PREVIEW_DATABASE_URL` を追加（Supabase/Neon等）
- [ ] `PREVIEW_PAYLOAD_SECRET` を追加
- [ ] `PREVIEW_PAYLOAD_PREVIEW_SECRET` を追加
- [ ] `VERCEL_TOKEN` を追加
- [ ] `VERCEL_ORG_ID` を追加
- [ ] `VERCEL_PROJECT_ID` を追加

### 本番デプロイ機能を使う場合（追加）

- [ ] `PRODUCTION_DATABASE_URL` を追加
- [ ] `PRODUCTION_PAYLOAD_SECRET` を追加
- [ ] `PRODUCTION_PAYLOAD_PREVIEW_SECRET` を追加
- [ ] `NEXT_PUBLIC_SERVER_URL` を追加
- [ ] S3関連のSecretsを追加（5個）
- [ ] GitHub Environment設定で`production`環境を作成
- [ ] 必要に応じて手動承認を設定

---

## 🔗 参考リンク

- [GitHub Secrets ドキュメント](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel CLI ドキュメント](https://vercel.com/docs/cli)
- [Payload CMS 環境変数](https://payloadcms.com/docs/configuration/overview)
- [Next.js 環境変数](https://nextjs.org/docs/basic-features/environment-variables)

---

## 💡 まとめ

最小限の設定（E2Eテストのみ）であれば、**3つのSecrets**だけで開始できます：

1. `TEST_DATABASE_URL`
2. `TEST_PAYLOAD_SECRET`
3. `TEST_PAYLOAD_PREVIEW_SECRET`

これらを設定後、GitHub Actionsでワークフローを手動実行して動作確認してください。

その後、必要に応じてプレビュー環境や本番環境のSecretsを追加していくことをお勧めします。
