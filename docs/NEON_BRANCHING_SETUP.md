# Neon Database Branching for CI/CD

このガイドでは、CI/CD環境でNeonデータベースの分岐機能を使用するための設定方法を説明します。

---

## 📋 前提条件

- Neonプロジェクトが既に存在する
- `development` と `production` ブランチが設定済み
- GitHub Actions を使用している

---

## 🚀 セットアップ手順

### ステップ1: Neon API キーの取得

1. [Neon Console](https://console.neon.tech/) にログイン
2. 左サイドバー → **Settings** → **API Keys**
3. **Generate new API key** をクリック
   - 名前: `github-actions-ci`
   - スコープ: Full access
4. 生成されたキーをコピー（後で使用）

### ステップ2: Neon Project ID の確認

1. Neon Console でプロジェクトを開く
2. **Settings** → **General**
3. **Project ID** をコピー（例: `cool-meadow-12345678`）

### ステップ3: GitHub Secrets の設定

GitHubリポジトリで以下のSecretsを追加：

```
Settings → Secrets and variables → Actions → New repository secret
```

| Secret名 | 値 | 説明 |
|----------|-----|------|
| `NEON_API_KEY` | 生成したAPIキー | Neon APIへのアクセス |
| `NEON_PROJECT_ID` | プロジェクトID | Neonプロジェクトの識別子 |

---

## 🔧 使い方

### CI/CDでの自動ブランチ作成

GitHub Actionsワークフローでは、以下のように自動的にテスト用ブランチが作成・削除されます：

```yaml
# テストブランチ作成
- name: Create Neon test branch
  run: bun scripts/neon-branch.ts create

# テスト実行
- name: Run tests
  run: bun run test:ci
  env:
    DATABASE_URL: ${{ env.NEON_DATABASE_URL }}

# クリーンアップ
- name: Delete Neon test branch
  if: always()
  run: bun scripts/neon-branch.ts delete
```

### ローカルでのテスト

開発環境でNeonブランチ機能をテストするには：

```bash
# 環境変数を設定
export NEON_API_KEY="your-api-key"
export NEON_PROJECT_ID="your-project-id"

# ブランチ一覧を確認
bun scripts/neon-branch.ts list

# テストブランチ作成
bun scripts/neon-branch.ts create

# ブランチ削除（NEON_BRANCH_IDが必要）
export NEON_BRANCH_ID="br-xxx"
bun scripts/neon-branch.ts delete
```

---

## 📊 仕組み

### ブランチ作成フロー

```
1. GitHub Actions トリガー
   ↓
2. Neon API でブランチ作成
   - 名前: ci-{GITHUB_RUN_ID}
   - 親: development ブランチ
   ↓
3. 接続文字列を環境変数に設定
   - NEON_DATABASE_URL
   - NEON_BRANCH_ID
   ↓
4. マイグレーション実行
   ↓
5. テスト実行
   ↓
6. ブランチ削除（自動クリーンアップ）
```

### 親ブランチの選択

デフォルトでは `development` ブランチを親として使用します：

```typescript
// scripts/neon-branch.ts
parent_id: 'br-development'  // developmentブランチのID
```

これにより:
- テスト用データ・スキーマが即座に利用可能
- マイグレーションは差分のみ実行
- 高速なブランチ作成（2-5秒）

---

## 💰 コストと制限

### 無料枠（Free Tier）

- **プロジェクト数**: 100
- **コンピュート**: 100 CU時間/月/プロジェクト
- **ストレージ**: 0.5GB/ブランチ
- **データ転送**: 5GB/月

### 実際の使用量試算

```
CI実行頻度: 週20回 × 4週 = 80回/月
1回のテスト時間: 5分
コンピュート: 0.25 CU × 80回 × 5/60時間 = 1.67 CU時間/月

結論: 無料枠（100 CU時間）で十分
```

### ブランチの自動削除

テストブランチは実行後に自動削除されるため、ストレージは消費しません。

---

## 🔍 トラブルシューティング

### エラー: API authentication failed

**原因**: NEON_API_KEYが正しくない

**解決策**:
1. Neon Consoleで新しいAPIキーを生成
2. GitHub Secretsを更新
3. ワークフローを再実行

### エラー: Branch creation failed

**原因**: 親ブランチID (`br-development`) が存在しない

**解決策**:
1. Neon Consoleでブランチ一覧を確認
2. `scripts/neon-branch.ts` の `parent_id` を更新

```typescript
// developmentブランチの正しいIDを確認
bun scripts/neon-branch.ts list

// 出力例:
//   • development
//     ID: br-ancient-sun-12345678  ← これを使用
```

3. `scripts/neon-branch.ts` を修正:

```typescript
parent_id: 'br-ancient-sun-12345678'  // 実際のIDに置き換え
```

### エラー: Connection timeout

**原因**: Neonブランチの起動に時間がかかっている

**解決策**:
ワークフローに待機時間を追加:

```yaml
- name: Wait for Neon branch to be ready
  run: sleep 10

- name: Run migrations
  run: bun run test:migrate
```

---

## ⚙️ 高度な設定

### カスタム親ブランチ

特定のブランチを親として使用する場合：

```typescript
// scripts/neon-branch.ts
parent_id: process.env.NEON_PARENT_BRANCH_ID || 'br-development'
```

GitHub Actionsで指定:

```yaml
env:
  NEON_PARENT_BRANCH_ID: br-custom-parent-12345678
```

### ブランチの有効期限設定

長時間テストの場合、ブランチに有効期限を設定:

```typescript
// scripts/neon-branch.ts の createBranch() 内
body: JSON.stringify({
  branch: {
    name: BRANCH_NAME,
    parent_id: 'br-development',
  },
  endpoints: [{
    type: 'read_write',
    autoscaling_limit_min_cu: 0.25,
    autoscaling_limit_max_cu: 1,
    // 1時間後に自動削除
    ttl: 3600,
  }],
}),
```

---

## 📈 メリット

### Docker Composeと比較

| 項目 | Docker Compose | Neon Branches |
|------|----------------|---------------|
| 起動時間 | 10-30秒 | 2-5秒 |
| リソース | CPU・メモリ消費 | スケールトゥゼロ |
| データ | マイグレーション毎回 | 親から即座コピー |
| 並列実行 | ポート競合 | 完全隔離 |
| クリーンアップ | 手動 | 自動 |

### CI実行時間の短縮

```
Before (Docker):
  Docker起動: 15秒
  マイグレーション: 10秒
  テスト実行: 5分
  合計: 5分25秒

After (Neon):
  ブランチ作成: 3秒
  マイグレーション: 2秒（差分のみ）
  テスト実行: 5分
  合計: 5分5秒

削減率: 約6%（20秒短縮）
```

---

## 🔗 参考リンク

- [Neon Branching Documentation](https://neon.com/docs/introduction/branching)
- [Neon API Reference](https://api-docs.neon.tech/reference/getting-started-with-neon-api)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

## ✅ まとめ

Neon Database Branchingを導入することで:

1. **CI実行時間の短縮** - Docker起動待ち不要
2. **完全な環境隔離** - 並列テストの競合なし
3. **自動クリーンアップ** - ブランチの自動削除
4. **コスト最適化** - 無料枠内で運用可能

既にNeonを使用しているため、追加コストなしでこれらのメリットを享受できます。
