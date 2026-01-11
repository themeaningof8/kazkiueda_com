#!/usr/bin/env bun

/**
 * Renovate設定ファイルのバリデーションスクリプト
 *
 * 実行方法:
 *   bun run scripts/validate-renovate-config.ts
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

interface RenovateConfig {
  $schema?: string;
  extends?: string[];
  packageRules?: PackageRule[];
  [key: string]: unknown;
}

interface PackageRule {
  description?: string;
  groupName?: string;
  matchPackagePatterns?: string[];
  matchPackageNames?: string[];
  automerge?: boolean;
  labels?: string[];
  [key: string]: unknown;
}

const CONFIG_PATH = join(process.cwd(), "renovate.json");

function validateConfig(): void {
  console.log("🔍 Renovate設定ファイルを検証中...\n");

  // 1. ファイルの存在確認
  let config: RenovateConfig;
  try {
    const content = readFileSync(CONFIG_PATH, "utf-8");
    const parsedContent = JSON.parse(content);

    // 基本的な型チェック
    if (typeof parsedContent !== "object" || parsedContent === null) {
      throw new Error("設定ファイルがオブジェクトではありません");
    }

    config = parsedContent as RenovateConfig;
    console.log("✅ renovate.json が正しくパースできました");
  } catch (error) {
    console.error("❌ renovate.json の読み込みに失敗しました:", error);
    process.exit(1);
  }

  // 2. 必須フィールドの確認
  const requiredFields = ["extends", "packageRules"];
  for (const field of requiredFields) {
    if (!(field in config)) {
      console.error(`❌ 必須フィールド '${field}' がありません`);
      process.exit(1);
    }
  }
  console.log("✅ 必須フィールドが存在します");

  // 3. パッケージルールの検証
  const packageRules = config.packageRules || [];
  console.log(`\n📋 パッケージルール数: ${packageRules.length}`);

  let automergeCount = 0;
  let manualReviewCount = 0;

  for (const rule of packageRules) {
    if (rule.automerge === true) {
      automergeCount++;
    } else if (rule.automerge === false) {
      manualReviewCount++;
    }

    // descriptionがあることを推奨
    if (!rule.description) {
      console.warn(`⚠️  ルール '${rule.groupName || "名前なし"}' にdescriptionがありません`);
    }
  }

  console.log(`  - 自動マージルール: ${automergeCount}`);
  console.log(`  - 手動レビュールール: ${manualReviewCount}`);

  // 4. 自動マージルールの詳細
  console.log("\n🤖 自動マージ対象:");
  for (const rule of packageRules) {
    if (rule.automerge === true) {
      const patterns = rule.matchPackagePatterns || [];
      const names = rule.matchPackageNames || [];
      console.log(`  - ${rule.groupName || rule.description || "名前なし"}`);
      if (patterns.length > 0) {
        console.log(`    パターン: ${patterns.join(", ")}`);
      }
      if (names.length > 0) {
        console.log(`    パッケージ: ${names.join(", ")}`);
      }
    }
  }

  // 5. 重要な設定の確認
  console.log("\n⚙️  重要な設定:");
  console.log(`  - タイムゾーン: ${config.timezone || "未設定"}`);
  console.log(`  - スケジュール: ${JSON.stringify(config.schedule || "未設定")}`);
  console.log(`  - 同時PR上限: ${config.prConcurrentLimit || "未設定"}`);
  console.log(`  - 時間PR上限: ${config.prHourlyLimit || "未設定"}`);

  // 6. セキュリティ設定の確認
  if (config.vulnerabilityAlerts) {
    console.log("✅ セキュリティアラートが有効です");
  } else {
    console.warn("⚠️  セキュリティアラートが無効です");
  }

  // 7. グループ化ルールの確認
  console.log("\n📦 グループ化ルール:");
  for (const rule of packageRules) {
    if (rule.groupName) {
      const patterns = rule.matchPackagePatterns || [];
      const names = rule.matchPackageNames || [];
      console.log(`  - ${rule.groupName}`);
      console.log(`    マッチング: ${[...patterns, ...names].join(", ")}`);
    }
  }

  console.log("\n✅ すべての検証に成功しました！");
  console.log("\n次のステップ:");
  console.log("1. GitHubラベルを作成: ./scripts/setup-renovate-labels.sh");
  console.log("2. Renovate Appをインストール: https://github.com/apps/renovate");
  console.log("3. オンボーディングPRを確認");
}

// メイン実行
try {
  validateConfig();
} catch (error) {
  console.error("❌ 予期しないエラーが発生しました:", error);
  process.exit(1);
}
