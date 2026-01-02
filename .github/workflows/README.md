# GitHub Actions Workflows

Testing Trophyに沿ったCI/CDと環境ゲートの概要です。

## ワークフロー一覧（現行）

- `ci.yml`  
  - **トリガー**: PR, push main  
  - **内容**: static → unit → integration（matrix）→ e2e-essential → staging deploy（mainのみ、smoke付き）  
  - **依存**: `reusable-tests.yml`

- `e2e-nightly.yml`  
  - **トリガー**: 毎日 02:00 JST / 手動  
  - **内容**: e2e-full（全Playwright spec） + 結果サマリ

- `deploy-production.yml`  
  - **トリガー**: 手動 (`workflow_dispatch`)  
  - **内容**: 最新mainをデプロイ（SHAをStep Summaryに記録）→ migrate → Vercel `--prod` → smoke
  - **環境**: `environment: production`（承認を付ける想定）

- `pr-preview.yml`  
  - **トリガー**: PR open/update  
  - **内容**: Vercel Preview + PRコメント + オプションでsmoke

- `scheduled-maintenance.yml`  
  - **トリガー**: 週次/手動  
  - **内容**: 依存/重複/未使用チェックなど

- `reusable-setup.yml`（composite action）  
  - checkout / bun / cache / bun install / Playwright (opt)

- `reusable-tests.yml`（workflow_call, プリセット方式）  
  - suite: static | unit | integration | e2e-essential | e2e-full  
  - DB up/down, migrate, Next起動、Playwright、artifact収集を共通化

### 削除した旧ワークフロー
- ci-fast.yml, e2e.yml, e2e-full.yml, deploy.yml, deploy-fast.yml

## Secrets / 環境変数の入口
- dotenvxを統一利用。CIでは `DOTENV_PRIVATE_KEY_DEVELOPMENT` / `DOTENV_PRIVATE_KEY_PRODUCTION` を渡す。
- Vercel: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- 本番: `DOTENV_PRIVATE_KEY_PRODUCTION`, `NEXT_PUBLIC_SERVER_URL`, S3関連
- テスト:
  - `DOTENV_PRIVATE_KEY_DEVELOPMENT` で暗号化された `projects/.env.development` を復号
  - `.env` (共通) には `PAYLOAD_PREVIEW_SECRET` が含まれる（全環境で共有）
  - `.env.development` には `PAYLOAD_SECRET` などが含まれる
  - `DATABASE_URL` のみCIワークフローで直接オーバーライド（`postgresql://test:test@localhost:5433/kazkiueda_test`）

## パイプラインの流れ
- PR/main: テスト（static/unit/integration/e2e-essential）→ mainのみ stagingデプロイ → staging smoke
- Nightly: e2e-full
- Production: 手動で最新mainをデプロイ（承認ゲート）

## 運用メモ
- stagingとproductionの同期確認: productionデプロイ時にStep Summaryへデプロイ対象SHAを記録
- Nightly失敗はGitHub UIのサマリで確認（必要ならSlack通知を追加）
- すべてのテスト/デプロイは package.json のscriptsを入口として呼び出し
