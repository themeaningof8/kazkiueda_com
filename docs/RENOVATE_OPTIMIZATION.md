# Renovate PR Integration Test Optimization

## 概要

Renovate PRでの不要なintegration test実行を回避し、Neon DBブランチの作成を削減する最適化を実装しました。

## 問題

Renovateが`renovate/*`パターンのブランチを作成する際、以下の問題が発生していました:

1. **CI Integration Tests**: 各PR実行時に6つの一時的なNeon DBブランチが作成される（テストスイートのmatrix実行）
2. **高頻度のPR**: Renovateの設定により週に複数のPRが同時作成される
3. **結果**: Neon DBブランチが大量に作成され、integration testが失敗

## Phase 1実装: 依存関係のみの変更検出とテストスキップ

### 実装内容

#### 1. 依存関係変更検出スクリプト (`scripts/detect-dependency-only-changes.ts`)

PRの変更内容を解析し、依存関係のみの変更かどうかを判定します:

- **依存関係ファイル**: `package.json`, `bun.lockb`, lockfileのみ
- **許可ファイル**: `.github/workflows/ci.yml`, `.github/workflows/reusable-tests.yml`
- **コード変更検出**: `src/`, `tests/`, `__tests__/`, `scripts/`, config filesの変更をチェック

**終了コード:**
- `0`: 依存関係のみの変更（integration testスキップ可）
- `1`: コード/設定変更あり（full test実行）

#### 2. CI Workflow修正 (`.github/workflows/ci.yml`)

新しいジョブ `detect-changes` を追加:

```yaml
detect-changes:
  name: Detect Change Type
  runs-on: ubuntu-latest
  outputs:
    skip_integration: ${{ steps.analyze.outputs.skip_integration }}
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - uses: ./.github/actions/setup
    - name: Analyze PR changes
      run: bunx tsx scripts/detect-dependency-only-changes.ts
```

`integration` ジョブに条件追加:

```yaml
integration:
  needs: [unit, detect-changes]
  if: needs.detect-changes.outputs.skip_integration != 'true'
  # 既存の設定...
```

#### 3. Renovate設定更新 (`renovate.json`)

低リスクな依存関係更新に `skip-integration-tests` ラベルを追加:

- **型定義** (`@types/*`): automerge + skip-integration-tests
- **開発ツールpatch** (devDependencies patch): automerge + skip-integration-tests

## 期待される効果

| 指標 | 現状 | Phase 1目標 |
|------|------|------------|
| 同時存在Neonブランチ数 | 18-30 | <12 |
| Integration test実行率 | 100% | 40% |
| Renovate PR CI実行時間 | ~15分 | ~8分 |
| テスト失敗率 | <2% | <2% (変わらず) |

### 削減メカニズム

1. **型定義更新PR** (週1-2回): integration test完全スキップ → 6ブランチ削減
2. **dev tool patch PR** (週1-2回): integration test完全スキップ → 6ブランチ削減
3. **その他PR**: Full test実行（品質維持）

**予想削減率**: 約60% (週12-18ブランチ削減)

## テスト方法

### ローカルテスト

```bash
# Renovateブランチをシミュレート
export GITHUB_HEAD_REF="renovate/types-node-22.x"
export GITHUB_BASE_REF="main"

# 検出スクリプトを実行
bunx tsx scripts/detect-dependency-only-changes.ts

# 期待結果: exit code 0 (依存関係のみ)
```

### CI動作確認

1. 型定義のpatch更新PRを作成（または次のRenovate PRを待つ）
2. GitHub Actions実行ログを確認:
   - `detect-changes` ジョブが成功
   - `skip_integration=true` が出力される
   - `integration` ジョブがスキップされる
   - `static`, `unit` ジョブは正常実行
3. Neon consoleで `ci-*` ブランチが6個作成されないことを確認

## モニタリング

### Week 1-2: 効果測定

以下の指標を1-2週間モニタリング:

1. **Neonブランチ削減率**: Neon consoleで同時存在ブランチ数を確認
2. **CI実行時間**: Renovate PR時の実行時間を測定
3. **テスト失敗率**: main merge後の失敗率を追跡
4. **問題検出漏れ**: automerge対象PRで問題が発生していないか確認

### 判定基準

- **成功** (60%削減達成): Phase 2不要、現状維持
- **不十分** (削減率<50%): Phase 2実装を検討

## 次のステップ

Phase 1の効果を確認後、必要に応じて以下を実装:

### Phase 2: Vercel Preview最適化 (オプション)

- Vercel deployment制御によるpreview DB作成削減
- Neon branch cleanup自動化

### Phase 3: 包括的最適化 (オプション)

- Renovate grouping強化
- 差分テスト実行
- インテリジェントブランチライフサイクル管理

詳細は `/Users/kazkiueda/.claude/plans/velvety-orbiting-mango.md` 参照

## トラブルシューティング

### integration testが意図せずスキップされる

1. `detect-changes` ジョブのログを確認
2. 変更ファイルリストを確認
3. 必要に応じて `scripts/detect-dependency-only-changes.ts` の判定ロジックを調整

### Renovate PRでfull testが実行される

- 期待通り: コード/設定変更を含むPRは full test実行
- 確認: PR変更内容が依存関係のみかチェック

### automerge対象PRで問題が発生

1. 該当パッケージを `renovate.json` から除外
2. `automerge: false` に変更
3. `skip-integration-tests` ラベルを削除

## ファイル

### 新規作成
- `scripts/detect-dependency-only-changes.ts`: 変更検出スクリプト
- `docs/RENOVATE_OPTIMIZATION.md`: このドキュメント

### 修正
- `.github/workflows/ci.yml`: detect-changesジョブ追加、integration条件追加
- `renovate.json`: skip-integration-testsラベル追加

## 参考

- [Renovate Documentation](https://docs.renovatebot.com/)
- [GitHub Actions: Conditional execution](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idif)
- [Neon Branching](https://neon.tech/docs/guides/branching)
