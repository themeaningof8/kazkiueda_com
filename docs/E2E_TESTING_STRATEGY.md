# E2Eテスト戦略：本番デプロイ前後のテスト設計

## 📊 3層のE2Eテスト戦略

本プロジェクトでは、**3つの異なる環境**でE2Eテストを実行し、段階的に品質を保証します。

```
┌─────────────────────────────────────────────────────────────┐
│                    E2E Testing Strategy                      │
└─────────────────────────────────────────────────────────────┘

Level 1: PR時の完全E2E (ci.yml)
  ├─ 環境: テスト環境 (localhost:3001)
  ├─ 範囲: 全E2Eテスト（5 suites）
  ├─ 時間: 20分（並列実行）
  └─ 目的: 機能の完全性を保証
          │
          ▼
Level 2: PRプレビュー環境でのSmoke Tests (pr-preview.yml)
  ├─ 環境: Vercel Preview環境
  ├─ 範囲: 重要なユーザーフロー
  ├─ 時間: 10分
  └─ 目的: 本番に近い環境での動作確認
          │
          ▼
Level 3: 本番デプロイ後のSmoke Tests (deploy.yml)
  ├─ 環境: 本番環境
  ├─ 範囲: 読み取り専用の重要ページ
  ├─ 時間: 5分
  └─ 目的: 本番環境の正常性確認
```

---

## Level 1: PR時の完全E2Eテスト

### 実行タイミング
- **トリガー**: Pull Request作成・更新時
- **ワークフロー**: `.github/workflows/ci.yml`

### テスト環境
```yaml
環境: テスト環境（Docker Compose + localhost）
DB: PostgreSQL (Docker)
Server: Next.js dev server (port 3001)
データ: テストデータ（Faker生成）
```

### テストスイート（5つ・並列実行）

| スイート | ファイル | 内容 |
|---------|---------|------|
| blog | `blog-list.spec.ts` | ブログ一覧ページの表示・ソート・フィルター |
| post-detail | `post-detail.spec.ts` | 記事詳細ページ・メタデータ・コンテンツ |
| accessibility | `accessibility.spec.ts` | WCAG 2.0 AA準拠（axe-core） |
| preview | `preview.spec.ts` | プレビュー機能・下書き表示 |
| error-handling | `error-handling.spec.ts` | 404エラー・エラー境界 |

### 実行時間
- **目標**: 20分
- **並列実行**: 5スイート同時実行

### 合格基準
- ✅ 全テストケースが成功
- ✅ アクセシビリティ違反ゼロ
- ✅ カバレッジ基準を満たす

### 実装例

```yaml
# ci.yml
e2e-tests:
  strategy:
    matrix:
      suite:
        - name: blog
          file: tests/e2e/blog-list.spec.ts
        # ...

  steps:
    - name: Start test database
      run: bun run test:db:up

    - name: Start Next.js server
      run: bunx next dev --port 3001 &

    - name: Run E2E Tests
      run: bunx playwright test ${{ matrix.suite.file }}
      env:
        DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

---

## Level 2: PRプレビュー環境でのSmoke Tests

### 実行タイミング
- **トリガー**: Pull Request作成・更新後、Vercelデプロイ完了時
- **ワークフロー**: `.github/workflows/pr-preview.yml`

### テスト環境
```yaml
環境: Vercel Preview環境
DB: プレビュー用DB（Supabase/Neon等）
Server: Vercel Edge Network
データ: プレビュー用データ
URL: pr-{number}.kazkiueda.com
```

### テストスイート

**1. E2E Smoke Tests（Playwright）**
- 使用ファイル: `tests/e2e/smoke-production.spec.ts`
- テスト内容:
  - ✅ ホームページの表示
  - ✅ ブログページの表示
  - ✅ 記事詳細ページの表示
  - ✅ 404ページの表示
  - ✅ 基本的なアクセシビリティ

**2. HTTP Smoke Tests（curl）**
- ホームページ: HTTP 200
- ブログページ: HTTP 200

### 実行時間
- **目標**: 10分
- **E2E**: 5分
- **HTTP**: 1分

### 合格基準
- ✅ 重要ページが正常に表示
- ✅ HTTP 200応答
- ✅ 基本的なアクセシビリティ

### 実装例

```yaml
# pr-preview.yml
e2e-preview:
  needs: deploy-preview

  steps:
    - name: Run E2E smoke tests on preview
      run: bunx playwright test tests/e2e/smoke-production.spec.ts
      env:
        PLAYWRIGHT_BASE_URL: ${{ needs.deploy-preview.outputs.preview-url }}

    - name: Comment PR with results
      run: |
        # PRにテスト結果をコメント
```

### PR通知の例

```markdown
## 🚀 Preview Deployment Ready!

✅ Preview URL: https://pr-123.kazkiueda.com

### Quick Links
- 🏠 [Homepage](https://pr-123.kazkiueda.com)
- 📝 [Blog](https://pr-123.kazkiueda.com/blog)
- ⚙️ [Admin Panel](https://pr-123.kazkiueda.com/admin)

---

✅ E2E smoke tests passed on preview deployment!
```

---

## Level 3: 本番デプロイ後のSmoke Tests

### 実行タイミング
- **トリガー**: 本番デプロイ完了後
- **ワークフロー**: `.github/workflows/deploy.yml`

### テスト環境
```yaml
環境: 本番環境
DB: 本番PostgreSQL
Server: Vercel Production
データ: 本番データ（読み取り専用）
URL: kazkiueda.com
```

### テストスイート

**1. Health Checks（curl）**
- ホームページ: HTTP 200
- ブログページ: HTTP 200
- APIエンドポイント: HTTP 200/404

**2. E2E Smoke Tests（Playwright）**
- 使用ファイル: `tests/e2e/smoke-production.spec.ts`
- **重要**: 読み取り専用テストのみ
- テスト内容:
  - ✅ ホームページの表示
  - ✅ ブログページの表示
  - ✅ 公開記事の詳細ページ
  - ✅ 404ページ
  - ✅ 基本的なARIA属性

### 実行時間
- **目標**: 5分
- **Health Check**: 1分
- **E2E**: 4分

### 合格基準
- ✅ 全ページがHTTP 200応答
- ✅ E2E Smoke Testsが成功
- ✅ 本番データが正しく表示

### 制約事項

**❌ 禁止事項（本番環境のため）**
- データベースへの書き込み
- テストデータの作成
- 認証が必要な操作
- 課金に影響する操作

**✅ 許可事項**
- 公開ページの閲覧
- 公開APIの呼び出し（GET）
- 基本的なナビゲーション

### 実装例

```yaml
# deploy.yml
smoke-tests-production:
  needs: health-check

  steps:
    - name: Run production smoke tests
      run: bunx playwright test tests/e2e/smoke-production.spec.ts
      env:
        PLAYWRIGHT_BASE_URL: ${{ secrets.NEXT_PUBLIC_SERVER_URL }}
```

---

## 📝 Smoke Tests実装ガイド

### smoke-production.spec.ts の設計原則

```typescript
/**
 * 本番環境用のSmoke Tests
 *
 * 設計原則:
 * 1. 読み取り専用のテストのみ
 * 2. データベースへの書き込み禁止
 * 3. 認証が必要な機能はテストしない
 * 4. 実行時間を短く保つ（5分以内）
 * 5. 本番データに依存しない（存在チェックのみ）
 */

test.describe('本番環境 Smoke Tests', () => {
  test('ホームページが正常に表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // 基本的なページ構造の存在確認のみ
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
  });

  test('公開記事が存在する場合、詳細ページが表示される', async ({ page }) => {
    await page.goto('/blog');

    const articleLink = page.locator('article a').first();
    const articleCount = await articleLink.count();

    // 記事が存在する場合のみテスト
    if (articleCount > 0) {
      const href = await articleLink.getAttribute('href');
      await page.goto(href!);
      await expect(page.locator('article')).toBeVisible();
    } else {
      // 記事がない場合はスキップ
      test.skip();
    }
  });
});
```

### ベストプラクティス

#### ✅ Good

```typescript
// 存在チェックのみ
await expect(page.locator('h1')).toBeVisible();

// 本番データに依存しない
const articles = await page.locator('article').count();
if (articles > 0) {
  // テスト実行
}

// 読み取り専用
await page.goto('/blog');
await expect(page).toHaveURL('/blog');
```

#### ❌ Bad

```typescript
// 特定のデータに依存
await expect(page.locator('h1')).toHaveText('特定の記事タイトル');

// データベースへの書き込み
await page.click('button[data-testid="create-post"]');

// 認証が必要な操作
await page.goto('/admin/posts');
```

---

## 🎯 各レベルの比較表

| 項目 | Level 1: PR時 | Level 2: Preview | Level 3: Production |
|------|---------------|------------------|---------------------|
| **環境** | Test (localhost) | Vercel Preview | Production |
| **DB** | Docker Postgres | Preview DB | Production DB |
| **データ** | テストデータ | Preview用 | 本番データ |
| **範囲** | 全E2E | Smoke Tests | Smoke Tests |
| **時間** | 20分 | 10分 | 5分 |
| **書き込み** | ✅ 可能 | ✅ 可能 | ❌ 禁止 |
| **認証** | ✅ テスト | ⚠️ 慎重に | ❌ 禁止 |
| **失敗時** | PR Block | 警告 | Alert + Rollback |

---

## 🔄 テスト実行フロー

### 通常のPRフロー

```
1. 開発者がPR作成
   │
   ▼
2. CI Pipeline実行（ci.yml）
   ├─ Static Analysis
   ├─ Unit Tests
   ├─ Integration Tests
   ├─ Build Test
   └─ E2E Tests (Level 1) ← 20分
   │
   ▼
3. PRプレビューデプロイ（pr-preview.yml）
   ├─ Build Preview
   ├─ Deploy to Vercel
   └─ E2E Smoke Tests (Level 2) ← 10分
   │
   ▼
4. レビュアーがPRレビュー
   │
   ▼
5. mainブランチにマージ
   │
   ▼
6. 本番デプロイ（deploy.yml）
   ├─ Build Production
   ├─ Database Migration
   ├─ Deploy to Vercel
   ├─ Health Check
   └─ E2E Smoke Tests (Level 3) ← 5分
   │
   ▼
7. デプロイ完了 ✅
```

### 失敗時のフロー

#### Level 1で失敗（PR時）
```
E2E Tests失敗
  ├─ PR Block（マージ不可）
  ├─ 開発者に通知
  └─ Playwrightレポートをアップロード
```

#### Level 2で失敗（Preview）
```
Preview E2E失敗
  ├─ PRにコメント（警告）
  ├─ マージは可能（警告のみ）
  └─ レビュアーが判断
```

#### Level 3で失敗（Production）
```
Production E2E失敗
  ├─ 即座にアラート
  ├─ Rollbackを検討
  ├─ On-call通知
  └─ インシデント記録
```

---

## 🛠️ トラブルシューティング

### Preview環境でのテスト失敗

**原因1**: Vercelデプロイの待機時間不足
```yaml
# 修正前
- name: Run E2E tests
  run: bunx playwright test

# 修正後
- name: Wait for deployment
  run: sleep 15  # または health check loop

- name: Run E2E tests
  run: bunx playwright test
```

**原因2**: Preview DBの接続エラー
```yaml
# PREVIEW_DATABASE_URL が正しく設定されているか確認
env:
  DATABASE_URL: ${{ secrets.PREVIEW_DATABASE_URL }}
```

### 本番環境でのテスト失敗

**原因1**: 本番データがない（新規デプロイ）
```typescript
// 対策: 柔軟なテスト設計
const articles = await page.locator('article').count();
if (articles > 0) {
  // テスト実行
} else {
  test.skip(); // データがない場合はスキップ
}
```

**原因2**: CDNキャッシュによる古いコンテンツ
```yaml
# Vercelデプロイ後に待機時間を追加
- name: Wait for CDN cache
  run: sleep 30
```

---

## 📊 メトリクス

### 目標値

| メトリクス | Level 1 | Level 2 | Level 3 |
|-----------|---------|---------|---------|
| 実行時間 | < 20分 | < 10分 | < 5分 |
| 成功率 | > 95% | > 90% | > 99% |
| カバレッジ | 全機能 | 重要フロー | 最重要ページ |
| リトライ | 2回 | 1回 | 0回 |

### モニタリング

```yaml
# GitHub Actions Insights で確認
- ワークフロー実行時間
- 成功/失敗率
- ボトルネックの特定
```

---

## 🚀 今後の拡張

### Phase 2: Visual Regression Testing

```yaml
- name: Visual regression tests
  uses: lost-pixel/lost-pixel@v3
  with:
    baseline-branch: main
```

### Phase 3: Performance Testing

```yaml
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v10
  with:
    urls: |
      https://kazkiueda.com
      https://kazkiueda.com/blog
```

### Phase 4: Canary Deployment

```yaml
# 段階的ロールアウト
1. 10%のトラフィックでデプロイ
2. Smoke Tests実行
3. 問題なければ100%へ
```

---

## 📚 参考リンク

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Vercel Preview Deployments](https://vercel.com/docs/concepts/deployments/preview-deployments)
- [GitHub Actions Workflows](https://docs.github.com/en/actions/using-workflows)

---

## ✅ まとめ

本プロジェクトのE2E戦略は、**3層のテスト環境**で段階的に品質を保証します：

1. **Level 1 (PR時)**: 全E2Eテストで機能の完全性を保証
2. **Level 2 (Preview)**: 本番に近い環境で重要フローを確認
3. **Level 3 (Production)**: 本番環境で最重要ページを検証

この多層アプローチにより、高い信頼性を保ちながら、本番デプロイのリスクを最小化しています。
