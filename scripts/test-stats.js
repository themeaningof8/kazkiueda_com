#!/usr/bin/env node

/**
 * テスト統計情報を収集・表示するスクリプト
 * Testing Trophyの観点からテストピラミッドを可視化
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

const TEST_TYPES = {
  static: {
    name: "Static Analysis",
    color: "🛡️",
    description: "型チェック、Linting、コード品質",
  },
  unit: {
    name: "Unit Tests",
    color: "🧪",
    description: "純粋関数、ユーティリティ、コンポーネント",
  },
  integration: {
    name: "Integration Tests",
    color: "🔗",
    description: "API、データベース、外部サービス統合",
  },
  e2e: {
    name: "E2E Tests",
    color: "🌐",
    description: "エンドツーエンドユーザーシナリオ",
  },
};

function parseVitestResults(results) {
  try {
    // Vitestの結果をパース（例: "Tests  42 passed (42)"）
    const testMatch = results.match(/Tests\s+(\d+)\s+passed/);
    const failedMatch = results.match(/(\d+)\s+failed/);
    const skippedMatch = results.match(/(\d+)\s+skipped/);

    return {
      passed: testMatch ? parseInt(testMatch[1]) : 0,
      failed: failedMatch ? parseInt(failedMatch[1]) : 0,
      skipped: skippedMatch ? parseInt(skippedMatch[1]) : 0,
    };
  } catch (error) {
    console.warn("Failed to parse Vitest results:", error.message);
    return { passed: 0, failed: 0, skipped: 0 };
  }
}

function parsePlaywrightResults(results) {
  try {
    // Playwrightの結果をパース（例: "5 passed (2.3s)"）
    const passedMatch = results.match(/(\d+)\s+passed/);
    return {
      passed: passedMatch ? parseInt(passedMatch[1]) : 0,
      failed: 0,
      skipped: 0,
    };
  } catch (error) {
    console.warn("Failed to parse Playwright results:", error.message);
    return { passed: 0, failed: 0, skipped: 0 };
  }
}

function getTestFilesCount(type) {
  const baseDir = join(process.cwd(), "src", "__tests__");

  if (type === "static") {
    // Static checksはファイル数ではなく実行回数
    return { files: 6, description: "checks" }; // TypeScript, Biome x4, JSCPD, Knip
  }

  if (type === "unit") {
    try {
      const unitDir = join(baseDir, "unit");
      if (!existsSync(unitDir)) return { files: 0, description: "files" };

      const files = require("fs")
        .readdirSync(unitDir)
        .filter((file) => file.endsWith(".test.ts") || file.endsWith(".test.tsx")).length;
      return { files, description: "files" };
    } catch {
      return { files: 0, description: "files" };
    }
  }

  if (type === "integration") {
    try {
      const integrationDir = join(baseDir, "integration");
      if (!existsSync(integrationDir)) return { files: 0, description: "files" };

      const files = require("fs")
        .readdirSync(integrationDir)
        .filter((file) => file.endsWith(".test.ts")).length;
      return { files, description: "files" };
    } catch {
      return { files: 0, description: "files" };
    }
  }

  if (type === "e2e") {
    try {
      const e2eDir = join(process.cwd(), "tests", "e2e");
      if (!existsSync(e2eDir)) return { files: 0, description: "specs" };

      const files = require("fs")
        .readdirSync(e2eDir)
        .filter((file) => file.endsWith(".spec.ts")).length;
      return { files, description: "specs" };
    } catch {
      return { files: 0, description: "specs" };
    }
  }

  return { files: 0, description: "items" };
}

function generatePyramid(stats) {
  const lines = [];
  const maxWidth = 50;

  // Testing Trophyの構造をテキストで表現
  lines.push("        🏆 Testing Trophy 🏆");
  lines.push("");
  lines.push("        /\\");
  lines.push("       /E2\\");
  lines.push("      /____\\");
  lines.push("     /      \\");
  lines.push("    / Integ  \\");
  lines.push("   /__________\\");
  lines.push("  /            \\");
  lines.push(" /     Unit     \\");
  lines.push("/________________\\");
  lines.push("|     Static     |");
  lines.push("------------------");
  lines.push("");

  // 統計情報を表示
  Object.entries(TEST_TYPES).forEach(([type, info]) => {
    const stat = stats[type];
    const fileInfo = getTestFilesCount(type);
    const totalTests = stat.passed + stat.failed + stat.skipped;

    lines.push(`${info.color} ${info.name}`);
    lines.push(`   ${info.description}`);
    lines.push(
      `   📊 Tests: ${totalTests} (${stat.passed} passed, ${stat.failed} failed, ${stat.skipped} skipped)`,
    );
    lines.push(`   📁 Files: ${fileInfo.files} ${fileInfo.description}`);
    lines.push("");
  });

  // バランス分析
  const totalUnit = stats.unit.passed;
  const totalIntegration = stats.integration.passed;
  const totalE2e = stats.e2e.passed;
  const totalStatic = 6; // static checks

  const trophyRatio = {
    static: totalStatic,
    unit: totalUnit,
    integration: totalIntegration,
    e2e: totalE2e,
  };

  lines.push("📈 Testing Trophy Balance Analysis:");
  lines.push(`   Static: ${trophyRatio.static} checks`);
  lines.push(`   Unit: ${trophyRatio.unit} tests`);
  lines.push(`   Integration: ${trophyRatio.integration} tests`);
  lines.push(`   E2E: ${trophyRatio.e2e} tests`);

  // Testing Trophyの理想的な比率に基づく評価
  const idealRatios = {
    static: 100, // 品質チェックの基礎
    unit: 70, // ユニットテストが最も多い
    integration: 20, // 統合テストは中間
    e2e: 10, // E2Eは最小限
  };

  const totalIdeal = Object.values(idealRatios).reduce((a, b) => a + b, 0);
  const totalActual = Object.values(trophyRatio).reduce((a, b) => a + b, 0);

  if (totalActual > 0) {
    const balanceScore = Object.entries(trophyRatio).reduce((score, [type, count]) => {
      const idealPercent = idealRatios[type] / totalIdeal;
      const actualPercent = count / totalActual;
      const diff = Math.abs(idealPercent - actualPercent);
      return score - diff * 50; // 差が大きいほどスコアが下がる
    }, 100);

    lines.push(`   🎯 Balance Score: ${Math.max(0, Math.round(balanceScore))}/100`);

    if (balanceScore >= 80) {
      lines.push("   ✅ Excellent balance - Testing Trophy achieved!");
    } else if (balanceScore >= 60) {
      lines.push("   ⚠️ Good balance, but could be improved");
    } else {
      lines.push("   🔧 Balance needs improvement");
    }
  }

  lines.push("");

  return lines.join("\n");
}

function main() {
  try {
    // 環境変数からテスト結果を取得
    const staticResult = process.env.TEST_STATIC_RESULT || "completed";
    const unitResult = process.env.TEST_UNIT_RESULT || "";
    const integrationResult = process.env.TEST_INTEGRATION_RESULT || "";
    const e2eResult = process.env.TEST_E2E_RESULT || "";

    const stats = {
      static: {
        passed: staticResult === "completed" ? 6 : 0, // 6つのstatic checks
        failed: staticResult === "completed" ? 0 : 6,
        skipped: 0,
      },
      unit: parseVitestResults(unitResult),
      integration: parseVitestResults(integrationResult),
      e2e: parsePlaywrightResults(e2eResult),
    };

    const pyramid = generatePyramid(stats);
    console.log(pyramid);
  } catch (error) {
    console.error("Error generating test pyramid:", error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
