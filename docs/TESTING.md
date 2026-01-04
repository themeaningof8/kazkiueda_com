# テスト戦略ガイド

このプロジェクトでは、信頼性の高いコードベースを維持するために、静的解析、単体テスト、結合テスト、およびE2Eテストを組み合わせた多層的なテスト戦略を採用しています。

## テストの構成

### 1. 静的解析 (Static Analysis)
コードの品質、スタイル、および基本的な誤りを自動的に検出します。
- **ツール**: Biome (Lint/Format), TypeScript, Madge (循環参照), JSCPD (コード重複), Knip (未使用コード)
- **実行**: `bun run test:static`
- **タイミング**: Pre-commit hook, CIの第1フェーズ

### 2. 単体テスト (Unit Tests)
個別の関数、ユーティリティ、純粋なコンポーネントを独立して検証します。
- **ツール**: Vitest, happy-dom
- **対象**: `src/__tests__/unit` 内のファイル
- **特徴**: 高速で、外部依存（DB等）を持ちません。
- **実行**: `bun run test:unit`

### 3. 結合テスト (Integration Tests)
複数のモジュール間の連携、特に Payload CMS のコレクション、アクセス制御、フック、およびデータベースの動作を実環境に近い状態で検証します。
- **ツール**: Vitest, Payload Local API, PostgreSQL (Docker/Neon)
- **対象**: `src/__tests__/integration` 内のファイル
- **特徴**: 実際にデータベースに書き込みを行い、アクセス権限などを検証します。
- **実行**: `bun run test:integration:all`

### 4. E2Eテスト (End-to-End Tests)
実際のブラウザを使用し、ユーザーの視点からアプリケーション全体の動作を検証します。
- **ツール**: Playwright
- **対象**: `tests/e2e` 内のファイル
- **特徴**: 認証フロー、ページ遷移、アクセシビリティ (Axe-core) を検証します。
- **実行**: `bun run test:e2e:essential` (主要テスト) / `bun run test:e2e:full` (全テスト)

---

## テストの実行とカバレッジ

### カバレッジの計測
単体テストと結合テストを合わせたプロジェクト全体の網羅率を計測します。
- **実行**: `bun run test:coverage:all`
- **目標値**: 
  - Lines: 75%
  - Functions: 80%
  - Branches: 62%
  - Statements: 75%

### CI/CD パイプライン
GitHub Actions で以下の順序で実行されます：
1. **Static Analysis**: 全てのプッシュ/PRで実行。
2. **Unit Tests**: 静的解析パス後に実行。
3. **Integration Tests**: 単体テストパス後に並列実行。
4. **E2E Essential**: 結合テストパス後に、ビルド済みの成果物に対して実行。
5. **E2E Full (Nightly)**: 毎日深夜に全E2Eテストを実行。

---

## 開発のガイドライン

### 新しい機能を追加する場合
1.  **ロジック**: `src/__tests__/unit` に単体テストを追加してください。
2.  **Payload コレクション/フック**: `src/__tests__/integration` に結合テストを追加し、アクセス制御が正しく設定されているか確認してください。
3.  **UI/ページ**: 主要なユーザー動線については `tests/e2e` にテストを追加してください。

### テストの安定性
- 結合テストは共有データベースを使用するため、Vitestの設定で `fileParallelism: false` に設定され、直列に実行されます。
- E2Eテストは、CI環境では `next build && next start` で起動したサーバーに対して実行することで、本番環境に近い動作を保証しています。
