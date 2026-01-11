#!/bin/bash

# Renovate用のGitHubラベルを作成するスクリプト
# 使い方: ./scripts/setup-renovate-labels.sh

set -e

echo "🏷️  Renovate用のGitHubラベルを作成します..."
echo ""

# GitHub CLIがインストールされているか確認
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) がインストールされていません"
    echo "インストール方法: https://cli.github.com/"
    exit 1
fi

# 認証確認
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLIで認証されていません"
    echo "実行してください: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI準備完了"
echo ""

# ラベル定義（名前、色、説明）
declare -a labels=(
    "dependencies|0366d6|本番依存関係の更新"
    "devDependencies|1d76db|開発依存関係の更新"
    "types|fbca04|型定義の更新"
    "security|d73a4a|セキュリティ更新"
    "automerge|128a0c|自動マージ対象"
    "payload|6f42c1|Payload CMS関連"
    "nextjs|000000|Next.js関連"
    "testing|d4c5f9|テストツール関連"
    "aws|ff9900|AWS SDK関連"
    "styling|db7093|スタイリング関連"
    "linter|7057ff|リンター/フォーマッター"
    "typescript|3178c6|TypeScript関連"
)

# ラベル作成
for label_def in "${labels[@]}"; do
    IFS='|' read -r name color description <<< "$label_def"

    # 既存のラベルをチェック
    if gh label list --search "$name" | grep -q "$name"; then
        echo "⏭️  スキップ: '$name' は既に存在します"
    else
        if gh label create "$name" --color "$color" --description "$description"; then
            echo "✅ 作成: '$name'"
        else
            echo "❌ 失敗: '$name' の作成に失敗しました"
        fi
    fi
done

echo ""
echo "🎉 ラベルのセットアップが完了しました！"
echo ""
echo "次のステップ:"
echo "1. https://github.com/apps/renovate でRenovate Appをインストール"
echo "2. オンボーディングPRを確認してマージ"
echo "3. 月曜日の朝を待つ（または手動で 'Check now' を実行）"
