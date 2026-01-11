# Renovate クイックスタートガイド

## 🚀 5分でセットアップ

### ステップ 1: GitHubラベルの作成

```bash
# GitHubにログイン済みの場合
bun run renovate:setup-labels

# または手動で実行
./scripts/setup-renovate-labels.sh
```

**GitHub CLIが未インストールの場合:**
1. https://cli.github.com/ からインストール
2. `gh auth login` で認証

---

### ステップ 2: Renovate設定の検証

```bash
bun run renovate:validate
```

以下のような出力が表示されれば成功:
```
✅ renovate.json が正しくパースできました
✅ 必須フィールドが存在します

📋 パッケージルール数: 12
  - 自動マージルール: 2
  - 手動レビュールール: 10
```

---

### ステップ 3: Renovate GitHub Appをインストール

1. https://github.com/apps/renovate にアクセス
2. **"Configure"** をクリック
3. リポジトリ `themeaningof8/kazkiueda_com` を選択
4. **"Install"** をクリック

---

### ステップ 4: オンボーディングPRを確認

Renovateが自動的に以下のPRを作成します:

```
タイトル: Configure Renovate
ラベル: dependencies
```

**やること:**
1. PRの内容を確認（renovate.jsonの設定が正しく反映されているか）
2. **"Merge pull request"** をクリック

---

### ステップ 5: 初回の依存関係更新PRを待つ

**次の月曜日 06:00 JST 前**に、Renovateが自動的にPRを作成します。

**作成されるPRの例:**
- `Update Payload CMS` - 手動レビュー
- `Update Type definitions` - 自動マージ（CIパス後）
- `Update Development tools (patch)` - 自動マージ（CIパス後）

---

## 📋 日常的な運用

### 月曜日の朝のルーチン

1. **PRの確認**
   - GitHub → Pull Requests → ラベル `dependencies` でフィルター

2. **自動マージPRのチェック**
   - ラベル `automerge` がついているPR
   - CIが通っていれば自動でマージ済み
   - Vercelデプロイを確認

3. **手動レビューPRの対応**
   - `payload` / `nextjs` ラベルのPR → CHANGELOGを確認
   - `security` ラベルのPR → 優先的に対応
   - 問題なければ **"Approve"** → **"Merge"**

---

## 🛠️ トラブルシューティング

### ❌ PRが作成されない

**原因:**
- スケジュール外（月曜06:00 JST前のみ）
- 既に3つのPRが存在（上限）

**対処:**
- リポジトリの Settings → Integrations → Renovate → **"Check now"** をクリック

### ❌ 自動マージされない

**原因:**
- CIが失敗している
- コンフリクトがある

**対処:**
```bash
# ローカルでmainブランチをマージ
git checkout renovate/xxx
git merge origin/main
git push
```

### ❌ マージ後にエラーが発生

**対処:**
```bash
# マージコミットを取り消し
git revert HEAD
git push
```

その後、renovate.jsonで一時的に無効化:
```json
{
  "ignoreDeps": ["problem-package"]
}
```

---

## 📊 運用状況の確認

### ダッシュボード

- https://developer.mend.io/ にアクセス
- GitHubアカウントでログイン
- リポジトリ `themeaningof8/kazkiueda_com` を選択

**確認できる情報:**
- 保留中の更新
- マージ済みの更新
- セキュリティアラート

### GitHub Issue Dependency Dashboard

Renovateは自動的に "Dependency Dashboard" Issueを作成します:
- すべての保留中の更新が一覧表示
- チェックボックスで個別にPR作成を制御可能

---

## 🎯 よくある質問

### Q: すべてのPRを一度に作成したい

**A:** Dependency Dashboard Issueで "Check the box below to create all pending PRs at once" にチェック

### Q: 特定のパッケージを更新したくない

**A:** renovate.jsonに追加:
```json
{
  "ignoreDeps": ["package-name"]
}
```

### Q: スケジュールを変更したい

**A:** renovate.jsonを編集:
```json
{
  "schedule": ["before 6am on Wednesday"]
}
```

### Q: 自動マージを無効化したい

**A:** renovate.jsonのすべての `"automerge": true` を `false` に変更

---

## 📚 参考リンク

- [詳細なセットアップガイド](.github/RENOVATE_SETUP.md)
- [Renovate公式ドキュメント](https://docs.renovatebot.com/)
- [設定リファレンス](https://docs.renovatebot.com/configuration-options/)
