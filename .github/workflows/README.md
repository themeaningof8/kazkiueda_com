# GitHub Actions Workflows

このディレクトリには、Testing Trophyに基づいた包括的なCI/CDパイプラインが含まれています。

## ワークフロー一覧

### 1. `ci.yml` - メインCIパイプライン

**トリガー**: PR作成時、mainブランチへのpush

Testing Trophyの各層を段階的に実行する、包括的なCIパイプラインです。

#### 実行順序とステージ

```
Stage 1: Static Analysis (5分)
  ├─ TypeScript型チェック
  ├─ Biome lint
  └─ フォーマットチェック

Stage 2: Security & Code Quality (10分)
  ├─ 依存関係の脆弱性監査
  ├─ 循環依存検出
  └─ 未使用エクスポート検出

Stage 3: Unit Tests (5分)
  ├─ 単体テスト実行（Vitest）
  └─ カバレッジレポート生成

Stage 4: Integration Tests (15分・並列実行)
  ├─ payload-client
  ├─ posts
  ├─ server-actions
  ├─ safe-action
  ├─ collections-posts
  ├─ collections-users
  └─ collections-media

Stage 5: Build Test (10分)
  ├─ 本番ビルド実行
  └─ バンドルサイズ分析

Stage 6: E2E Tests (20分・並列実行)
  ├─ blog
  ├─ post-detail
  ├─ accessibility
  ├─ preview
  └─ error-handling

Final: CI Success Check
  └─ 全ジョブの成功確認
```

#### 特徴

- **並列実行**: IntegrationテストとE2Eテストはmatrix strategyで並列実行
- **キャッシング**: 依存関係、Playwrightブラウザ、ビルド成果物をキャッシュ
- **カバレッジレポート**: Codecovへ自動アップロード
- **fail-fast無効**: 一部のテストが失敗しても全テストを実行

### 2. `e2e.yml` - E2Eテスト（既存）

**トリガー**: PR作成時、mainブランチへのpush

Playwrightを使用したE2Eテストのみを実行します。

**Note**: `ci.yml`が導入されたため、このワークフローは統合される予定です。

### 3. `deploy.yml` - 本番デプロイメント

**トリガー**: mainブランチへのpush、手動トリガー

本番環境へのデプロイメントワークフローです。

#### ステージ

1. **Pre-deployment Checks**
   - 型チェック
   - リントチェック

2. **Build for Production**
   - 本番ビルド実行
   - バンドルサイズ分析

3. **Database Migration**
   - Payload CMSマイグレーション実行
   - **Note**: `environment: production`で保護されており、手動承認が必要な場合があります

4. **Deploy to Vercel**
   - Vercelへデプロイ
   - デプロイURLをPRにコメント

5. **Post-deployment Health Check**
   - ホームページのヘルスチェック
   - ブログページのヘルスチェック
   - APIエンドポイントのチェック

6. **Notify Deployment Status**
   - デプロイ結果の通知
   - Slack通知（オプション）

#### 同時デプロイ防止

```yaml
concurrency:
  group: production-deployment
  cancel-in-progress: false
```

### 4. `pr-preview.yml` - PRプレビューデプロイ

**トリガー**: PR作成、更新、再オープン

PR毎にプレビュー環境をデプロイします。

#### ステージ

1. **Build Preview**
   - プレビュー用ビルド

2. **Deploy Preview**
   - Vercel Previewへデプロイ
   - カスタムエイリアス: `pr-{number}.kazkiueda.com`
   - PRにプレビューURLをコメント

3. **Smoke Tests**
   - プレビュー環境のホームページチェック
   - ブログページチェック
   - テスト結果をPRにコメント

#### PR毎のコンカレンシー制御

```yaml
concurrency:
  group: preview-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

### 5. `scheduled-maintenance.yml` - 定期メンテナンス

**トリガー**: 毎週月曜日 9:00 JST、手動トリガー

週次でのコード品質チェックとメンテナンスタスクを実行します。

#### ジョブ

1. **Dependency Check**
   - 古い依存関係の検出
   - セキュリティ脆弱性スキャン
   - 循環依存チェック

2. **Code Quality Metrics**
   - コード重複検出
   - 未使用エクスポート検出

3. **Coverage Report**
   - 全テストのカバレッジ収集
   - Codecovへアップロード

4. **Performance Benchmark**
   - パフォーマンステスト実行
   - ベンチマーク記録

5. **Database Health Check**
   - 本番DBの接続確認
   - バックアップ検証（オプション）

6. **Maintenance Summary**
   - 週次レポート生成
   - Slack通知（オプション）

---

## 必要なシークレット

### 共通

- `TEST_DATABASE_URL`: テスト用DB接続文字列
- `TEST_PAYLOAD_SECRET`: テスト用Payloadシークレット
- `TEST_PAYLOAD_PREVIEW_SECRET`: テスト用プレビューシークレット

### 本番デプロイ用

- `PRODUCTION_DATABASE_URL`: 本番DB接続文字列
- `PRODUCTION_PAYLOAD_SECRET`: 本番Payloadシークレット
- `PRODUCTION_PAYLOAD_PREVIEW_SECRET`: 本番プレビューシークレット
- `NEXT_PUBLIC_SERVER_URL`: 本番サーバーURL
- `S3_BUCKET`: S3バケット名
- `S3_ACCESS_KEY_ID`: S3アクセスキーID
- `S3_SECRET_ACCESS_KEY`: S3シークレットアクセスキー
- `S3_REGION`: S3リージョン
- `S3_ENDPOINT`: S3エンドポイント

### Vercel用

- `VERCEL_TOKEN`: Vercel APIトークン
- `VERCEL_ORG_ID`: Vercel組織ID
- `VERCEL_PROJECT_ID`: VercelプロジェクトID

### プレビューDB用

- `PREVIEW_DATABASE_URL`: プレビュー用DB接続文字列
- `PREVIEW_PAYLOAD_SECRET`: プレビュー用Payloadシークレット
- `PREVIEW_PAYLOAD_PREVIEW_SECRET`: プレビュー用プレビューシークレット

### オプション

- `CODECOV_TOKEN`: Codecovアップロード用トークン
- `SLACK_WEBHOOK`: Slack通知用Webhook URL

---

## ワークフローのカスタマイズ

### タイムアウトの調整

各ジョブには`timeout-minutes`が設定されています。プロジェクトのサイズに応じて調整してください。

```yaml
jobs:
  unit-tests:
    timeout-minutes: 5  # 小規模プロジェクト: 5分
    # timeout-minutes: 10  # 中規模プロジェクト: 10分
```

### 並列実行の調整

Integration/E2Eテストの並列度は`matrix.suite`で制御されています。

```yaml
strategy:
  fail-fast: false
  matrix:
    suite:
      - name: test1
      - name: test2
```

### 通知の追加

Slack通知を有効にする場合:

```yaml
- name: Slack notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

---

## トラブルシューティング

### E2Eテストがタイムアウトする

1. `playwright.config.ts`のタイムアウトを調整
2. サーバー起動待機時間を延長（`sleep 10` → `sleep 15`）
3. Playwrightブラウザのキャッシュをクリア

### Integrationテストでデータベース接続エラー

1. `docker-compose.test.yml`のヘルスチェック設定を確認
2. `--wait`フラグが正しく機能しているか確認
3. ポート競合をチェック（5433番ポート）

### ビルドがメモリ不足で失敗

1. ワークフローの`runs-on`を`ubuntu-latest-4-cores`に変更
2. Next.jsの`experimental.workerThreads: false`を設定

### キャッシュが効かない

1. `hashFiles('**/bun.lockb')`が正しく解決されているか確認
2. キャッシュキーを更新（バージョン番号を追加）

---

## ベストプラクティス

1. **段階的な実行**: 高速なテストを先に実行し、早期に失敗を検出
2. **並列化**: Independent なテストは並列実行してCI時間を短縮
3. **キャッシング**: 依存関係とビルド成果物をキャッシュして実行時間を削減
4. **環境分離**: テスト、プレビュー、本番で異なる環境を使用
5. **手動承認**: 本番デプロイには`environment`設定で保護レイヤーを追加

---

## パフォーマンス目標

| ワークフロー | 目標時間 | 現在の設定 |
|------------|---------|-----------|
| CI (全体) | 30-40分 | 40分 |
| Unit Tests | 5分以内 | 5分 |
| Integration | 15分以内 | 15分（並列） |
| E2E | 20分以内 | 20分（並列） |
| Deploy | 15分以内 | 15分 |
| PR Preview | 10分以内 | 10分 |

---

## 参考リンク

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git/vercel-for-github)
- [Playwright CI](https://playwright.dev/docs/ci)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
