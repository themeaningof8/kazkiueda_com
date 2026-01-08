# Testing Strategy

## Testing Trophy 基準

### 概要
このプロジェクトでは [Testing Trophy](https://kentcdodds.com/blog/write-tests) の観点からテスト構成を設計・運用しています。

```text
     /\
    /  \
   /Integ\
  /______\
 /  Unit  \
/──────────\
|  Static   |
└──────────┘
```

### 各レイヤーの役割とCI実行基準

#### Static Analysis (静的解析)
**実行条件**: 常時 (PR/push)  
**目的**: コード品質の基盤を確保  
**対象**:
- TypeScript 型チェック (`tsc --noEmit`)
- Biome Linting & Formatting (`biome lint`, `biome check`)
- 循環依存チェック (`madge --circular`)
- 重複コード検出 (`jscpd`)
- 未使用コード検出 (`knip`)

**基準**: 全てのチェックが0エラーでなければCI失敗

#### Unit Tests (単体テスト)
**実行条件**: 常時 (PR/push)  
**目的**: 個々の関数/コンポーネントの論理的正確性を確保  
**対象**: `src/__tests__/unit/` の全テスト（一部除外あり）

**基準**: テストが落ちたらCI失敗
- 除外テストの扱いは[CI除外ユニットテストの扱い](#ci除外ユニットテストの扱い)参照

#### Integration Tests (統合テスト)
**実行条件**: 常時 (PR/push)  
**目的**: 外部サービス/DBとの連携を検証  
**対象**: `src/__tests__/integration/`
- payload-client
- posts
- collections-posts
- collections-users
- collections-media
- performance

**基準**: テストが落ちたらCI失敗

#### E2E Essential Tests (エンドツーエンド必須テスト)
**実行条件**: 常時 (PR/push)  
**目的**: 主要ユーザシナリオの回帰を防ぐ  
**対象**: `tests/e2e/*-essential.spec.ts`

**基準**: テストが落ちたらCI失敗  
**選定基準**: [Essential E2Eの選定基準](#essential-e2eの選定基準)参照

#### E2E Full Tests (エンドツーエンド全テスト)
**実行条件**: Nightly (週次)  
**目的**: 完全な機能カバレッジの継続的検証  
**対象**: `tests/e2e/` の全テスト

**基準**: 失敗してもCIは失敗しない（アラートのみ）

#### Mutation Tests (ミューテーションテスト)
**実行条件**: Scheduled (週次) or main push のみ  
**目的**: テスト網羅性の定量的評価  
**対象**: `src/lib/format-date.ts`, `src/lib/errors.ts`

**基準**: スコア監視用（CI失敗要因とはしない）

## Essential E2Eの選定基準

### 選定原則
Essential E2Eテストは「ユーザ価値の核心を守る」テストに限定し、以下の基準で選定：

1. **High User Impact**: 主要機能の破綻を防ぐ
2. **Regression Risk**: 過去の重大バグ再発リスクが高い
3. **Execution Speed**: 実行時間が短く、CI時間を圧迫しない
4. **Independence**: 他のテストに依存せず独立実行可能

### 現在のEssentialテストと選定理由

#### error-essential.spec.ts
- **守る価値**: アプリケーションの基本安定性（エラーページ表示）
- **Impact**: エラーハンドリングが壊れると全ユーザ影響
- **Regression Risk**: 高（過去に404/500エラーページが表示されなかった事例）

#### preview-essential.spec.ts
- **守る価値**: CMSプレビュー機能（編集者体験）
- **Impact**: コンテンツ更新ワークフローの破綻
- **Regression Risk**: 中（Payload CMS統合の複雑さ）

#### performance-essential.spec.ts
- **守る価値**: 基本的なパフォーマンスしきい値
- **Impact**: ユーザ体験の悪化
- **Regression Risk**: 高（バンドルサイズ増加による遅延）

#### accessibility-essential.spec.ts
- **守る価値**: 基本的なアクセシビリティ
- **Impact**: 障害者ユーザの利用不可
- **Regression Risk**: 中（WCAG準拠の維持）

### 選定プロセス
新規Essentialテスト追加時は、上記基準を満たすか評価し、このドキュメントを更新する。

## CI除外ユニットテストの扱い

### 除外されているテスト

#### bundle-size.test.ts
**除外理由**: CI環境でのファイルシステムアクセス制限（Next.jsビルド成果物の読み取り不可）

**恒久対応方針**:
- `main` push時のみ実行する特別ジョブを作成
- ローカル開発時は `bun run test:unit:ci` で実行可能

**当面の運用**:
- CIではスキップ（ローカルで定期確認）
- バンドルサイズ増加時は手動で実行して確認

#### payload-client.test.ts
**除外理由**: 複雑なモック設定による不安定さ

**恒久対応方針**:
- 統合テスト (`test:integration:payload-client`) に移行
- 純粋な単体テストとしては削除

**当面の運用**:
- CIではスキップ
- ロジック変更時は統合テストでカバー

#### pagination.test.tsx
**除外理由**: 複雑なモック設定による不安定さ

**恒久対応方針**:
- 統合テストに移行 or コンポーネントテストとして安定化
- React Testing Libraryのベストプラクティス適用

**当面の運用**:
- CIではスキップ
- UI変更時は手動確認

### 除外テストの管理ルール
1. 除外テストは定期的に恒久対応を検討
2. 除外理由が解消されたらCIに復帰
3. 除外テストの品質劣化を防ぐため、ローカル実行を継続

## 失敗時のデバッグ手順

### Static Analysis 失敗時
```bash
# ローカルで個別実行
bun run lint          # Biome linting
bun run check         # Biome check
bun run analyze:circular  # 循環依存
bun run analyze:duplication  # 重複コード
bun run analyze:unused     # 未使用コード
```

### Unit Test 失敗時
```bash
# 該当テストのみ実行
bun run test:coverage:unit

# または特定のファイル
bunx dotenvx run -f projects/.env.development -- vitest run src/__tests__/unit/target.test.ts
```

### Integration Test 失敗時
```bash
# DBセットアップ込みで実行
bun run test:integration:all

# または個別
bun run test:integration:payload-client
```

### E2E Test 失敗時

#### サーバ起動方式
- **CI**: `next build` + `next start`（本番寄り）
- **Local**: `next dev`（開発寄り）

#### デバッグステップ
1. **CIアーティファクト確認**:
   - playwright-report/: スクリーンショット/ビデオ
   - server-logs/: Next.jsログ（`/tmp/next-dev.log`）

2. **ローカル再現**:
   ```bash
   # サーバ起動
   bun run dev  # or build + start

   # E2E実行（デバッグモード）
   bun run test:e2e:debug
   ```

3. **Neon DB 関連**:
   - CIではテスト用ブランチが自動作成
   - 失敗時はブランチ削除前にDB状態を確認可能

#### よくある失敗パターン
- **Runtime Error overlay**: `next dev` 使用時のみ。`next build` では発生しない
- **Timeout**: ネットワーク/ビルド待ち。CIではリトライ設定あり
- **Flaky**: タイミング依存。ビデオ/スクリーンショットで原因特定

### Mutation Test 失敗時
```bash
# 個別実行
bun run test:mutation:format-date
bun run test:mutation:errors

# 結果確認
open reports/mutation/format-date/index.html
```

### 共通デバッグTips
- **環境変数**: `dotenvx` でプロジェクト環境を正しく読み込んでいるか確認
- **Node.js**: CIでは固定バージョンを使用。ローカルと同じバージョンでテスト
- **キャッシュ**: CIではNext.jsビルドキャッシュあり。ローカルではクリアして再現