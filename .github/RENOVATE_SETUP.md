# Renovate セットアップガイド

## 概要

このプロジェクトでは、依存関係の自動更新に [Renovate](https://docs.renovatebot.com/) を使用しています。

## セットアップ手順

### 1. Renovate GitHub Appのインストール

1. [Renovate GitHub App](https://github.com/apps/renovate) にアクセス
2. "Configure" をクリック
3. リポジトリを選択（`themeaningof8/kazkiueda_com`）
4. インストール

### 2. 初回実行の確認

インストール後、Renovateは自動的に：
- リポジトリをスキャン
- `renovate.json` を読み込み
- "Configure Renovate" というオンボーディングPRを作成

このPRをマージすると、Renovateが本格的に稼働します。

### 3. ラベルの作成

以下のラベルを手動で作成してください（GitHubのIssues → Labels）:

| ラベル名 | 色 | 説明 |
|---------|-----|------|
| `dependencies` | `#0366d6` | 本番依存関係の更新 |
| `devDependencies` | `#1d76db` | 開発依存関係の更新 |
| `types` | `#fbca04` | 型定義の更新 |
| `security` | `#d73a4a` | セキュリティ更新 |
| `automerge` | `#128a0c` | 自動マージ対象 |
| `payload` | `#6f42c1` | Payload CMS関連 |
| `nextjs` | `#000000` | Next.js関連 |
| `testing` | `#d4c5f9` | テストツール関連 |

**簡単な作成方法:**
```bash
# GitHub CLIを使用（推奨）
gh label create dependencies --color 0366d6 --description "本番依存関係の更新"
gh label create devDependencies --color 1d76db --description "開発依存関係の更新"
gh label create types --color fbca04 --description "型定義の更新"
gh label create security --color d73a4a --description "セキュリティ更新"
gh label create automerge --color 128a0c --description "自動マージ対象"
gh label create payload --color 6f42c1 --description "Payload CMS関連"
gh label create nextjs --color 000000 --description "Next.js関連"
gh label create testing --color d4c5f9 --description "テストツール関連"
```

---

## 設定戦略

### Phase 2: バランス型自動化（現在）

#### ✅ 自動マージ対象

1. **型定義（`@types/*`）**
   - 理由: 実行時に影響なし
   - 条件: CI通過

2. **開発ツールのパッチ更新**
   - 対象: devDependencies のパッチバージョン
   - 除外: `@biomejs/biome`, `typescript`（重要ツールは手動）
   - 条件: CI通過

#### ⚠️ 手動レビュー必須

1. **Payload CMS**
   - グループ化: すべてのPayloadパッケージを1つのPRに
   - 理由: 依存関係が密結合

2. **Next.js & React**
   - グループ化: next, react, react-dom
   - 理由: コアフレームワーク

3. **本番依存関係のすべて**
   - マイナー・メジャー更新
   - 理由: APIの破壊的変更の可能性

4. **セキュリティ更新**
   - スケジュール無視で即座にPR作成
   - ラベル: `security`
   - 理由: 緊急対応が必要だが、破壊的変更を含む場合がある

---

## 運用フロー

### 週次サイクル（推奨）

**月曜日 06:00 JST 前:**
- Renovateが自動実行
- PRが作成される（最大3つまで）

**月曜日 午前中:**
- PRをレビュー
- 自動マージ対象はCI通過後に自動でマージされる
- 手動レビュー対象をチェック

**月曜日 午後:**
- 必要に応じてPRをマージ
- mainブランチへのマージ → Vercel自動デプロイ

### 緊急時（セキュリティ更新）

Renovateはスケジュールを無視して即座にPRを作成します：
- ラベル: `security`
- 優先的にレビュー・マージ

---

## PRのレビューポイント

### 自動マージPRの確認

自動マージされたPRでも、以下を事後確認：
1. CIがすべて通過しているか
2. 意図しないフォーマット変更がないか
3. Vercelデプロイが成功しているか

問題があれば即座にrevert。

### 手動レビューPRのチェック項目

#### Payload CMS更新
- [ ] CHANGELOG確認（破壊的変更の有無）
- [ ] データベースマイグレーションが必要か
- [ ] 管理画面の動作確認

#### Next.js更新
- [ ] next.config.ts の変更が必要か
- [ ] アプリディレクトリ構造の変更
- [ ] ビルド時間の変化

#### テストツール更新
- [ ] テスト実行時間の変化
- [ ] 新しい警告・エラーの有無

---

## トラブルシューティング

### PRが作成されない

**原因:**
- スケジュール外（月曜06:00 JST前のみ実行）
- `prConcurrentLimit`に達している（最大3つ）

**対処:**
- 手動実行: リポジトリのSettings → Renovate → "Check now"
- 既存のPRをマージして枠を空ける

### 自動マージされない

**原因:**
1. CIが失敗している
2. コンフリクトがある
3. レビュー必須の設定になっている

**対処:**
1. CI失敗 → ログを確認して修正
2. コンフリクト → mainブランチをマージ
3. レビュー → Approve する

### マージ後にエラーが発生

**対処:**
1. `git revert` でマージコミットを取り消し
2. RenovateのPRをクローズ（新しいPRが作成される）
3. `ignoreDeps` に追加して一時的に更新を無効化

```json
{
  "ignoreDeps": ["problem-package"]
}
```

---

## 設定のカスタマイズ

### スケジュール変更

```json
{
  "schedule": ["before 6am on Wednesday"]  // 水曜日に変更
}
```

### 自動マージの無効化（Phase 1に戻す）

```json
{
  "packageRules": [
    {
      "matchPackagePatterns": ["*"],
      "automerge": false
    }
  ]
}
```

### 特定のパッケージを無視

```json
{
  "ignoreDeps": [
    "next",  // Next.jsの更新を一時的に止める
    "@payloadcms/db-postgres"
  ]
}
```

---

## 参考資料

- [Renovate公式ドキュメント](https://docs.renovatebot.com/)
- [設定オプション一覧](https://docs.renovatebot.com/configuration-options/)
- [プリセット一覧](https://docs.renovatebot.com/presets-default/)
- [GitHub App](https://github.com/apps/renovate)

---

## 変更履歴

| 日付 | Phase | 変更内容 |
|------|-------|---------|
| 2026-01-11 | Phase 2 | 初期設定（バランス型自動化） |
