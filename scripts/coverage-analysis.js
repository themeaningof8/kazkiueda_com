#!/usr/bin/env node

/**
 * カバレッジレポートを層別に分析するスクリプト
 * Testing Trophyの観点から各層のカバレッジを評価
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const COVERAGE_THRESHOLDS = {
  static: { lines: 100, functions: 100, branches: 100, statements: 100 },
  unit: { lines: 75, functions: 80, branches: 62, statements: 75 },
  integration: { lines: 85, functions: 85, branches: 75, statements: 85 },
  e2e: { lines: 90, functions: 90, branches: 80, statements: 90 },
};

function analyzeCoverageByLayer(coverageData) {
  const layers = {
    static: { files: [], coverage: { lines: 100, functions: 100, branches: 100, statements: 100 } },
    unit: { files: [], coverage: { lines: 0, functions: 0, branches: 0, statements: 0 } },
    integration: { files: [], coverage: { lines: 0, functions: 0, branches: 0, statements: 0 } },
    e2e: { files: [], coverage: { lines: 0, functions: 0, branches: 0, statements: 0 } },
  };

  // ファイルパスに基づいて層を分類
  Object.entries(coverageData).forEach(([filePath, fileCoverage]) => {
    let layer = "unit"; // デフォルト

    if (filePath.includes("__tests__/unit/")) {
      layer = "unit";
    } else if (filePath.includes("__tests__/integration/")) {
      layer = "integration";
    } else if (filePath.includes("tests/e2e/")) {
      layer = "e2e";
    } else if (
      filePath.includes("collections/") ||
      filePath.includes("lib/api/") ||
      filePath.includes("lib/posts.ts") ||
      filePath.includes("payload")
    ) {
      layer = "integration"; // APIとデータ層
    } else if (
      filePath.includes("components/") ||
      filePath.includes("lib/utils.ts") ||
      filePath.includes("lib/format-date.ts") ||
      filePath.includes("lib/constants.ts")
    ) {
      layer = "unit"; // ユーティリティとコンポーネント
    }

    layers[layer].files.push({
      path: filePath,
      coverage: fileCoverage,
    });
  });

  // 各層のカバレッジを集計
  Object.keys(layers).forEach((layer) => {
    if (layer === "static") return; // staticは手動設定

    const layerFiles = layers[layer].files;
    if (layerFiles.length === 0) return;

    const totals = { lines: 0, functions: 0, branches: 0, statements: 0 };
    const covered = { lines: 0, functions: 0, branches: 0, statements: 0 };

    layerFiles.forEach((file) => {
      const cov = file.coverage;
      totals.lines += cov.lines.total;
      totals.functions += cov.functions.total;
      totals.branches += cov.branches.total;
      totals.statements += cov.statements.total;

      covered.lines += cov.lines.covered;
      covered.functions += cov.functions.covered;
      covered.branches += cov.branches.covered;
      covered.statements += cov.statements.covered;
    });

    layers[layer].coverage = {
      lines: totals.lines > 0 ? Math.round((covered.lines / totals.lines) * 100) : 0,
      functions:
        totals.functions > 0 ? Math.round((covered.functions / totals.functions) * 100) : 0,
      branches: totals.branches > 0 ? Math.round((covered.branches / totals.branches) * 100) : 0,
      statements:
        totals.statements > 0 ? Math.round((covered.statements / totals.statements) * 100) : 0,
    };
  });

  return layers;
}

function generateCoverageReport(layers) {
  const lines = [];
  lines.push("📊 Testing Trophy Coverage Analysis");
  lines.push("=====================================");
  lines.push("");

  const layerInfo = {
    static: { name: "Static Analysis", emoji: "🛡️", color: "🟢" },
    unit: { name: "Unit Tests", emoji: "🧪", color: "🟡" },
    integration: { name: "Integration Tests", emoji: "🔗", color: "🟠" },
    e2e: { name: "E2E Tests", emoji: "🌐", color: "🔴" },
  };

  Object.entries(layers).forEach(([layerKey, layer]) => {
    const info = layerInfo[layerKey];
    const threshold = COVERAGE_THRESHOLDS[layerKey];
    const coverage = layer.coverage;

    lines.push(`${info.emoji} ${info.name}`);
    lines.push(`   Files: ${layer.files.length}`);

    if (layerKey !== "static") {
      lines.push(`   Coverage:`);
      lines.push(`     Lines: ${coverage.lines}% (target: ${threshold.lines}%)`);
      lines.push(`     Functions: ${coverage.functions}% (target: ${threshold.functions}%)`);
      lines.push(`     Branches: ${coverage.branches}% (target: ${threshold.branches}%)`);
      lines.push(`     Statements: ${coverage.statements}% (target: ${threshold.statements}%)`);

      // 目標達成状況
      const lineStatus = coverage.lines >= threshold.lines ? "✅" : "❌";
      const funcStatus = coverage.functions >= threshold.functions ? "✅" : "❌";
      const branchStatus = coverage.branches >= threshold.branches ? "✅" : "❌";
      const stmtStatus = coverage.statements >= threshold.statements ? "✅" : "❌";

      lines.push(
        `   Status: ${lineStatus} Lines ${funcStatus} Functions ${branchStatus} Branches ${stmtStatus} Statements`,
      );
    } else {
      lines.push(`   Coverage: 100% (Static analysis is always complete)`);
      lines.push(`   Status: ✅ Complete`);
    }

    lines.push("");
  });

  // 全体の評価
  const unitCoverage = layers.unit.coverage;
  const integrationCoverage = layers.integration.coverage;
  const e2eCoverage = layers.e2e.coverage;

  const overallScore = Math.round(
    (unitCoverage.lines +
      unitCoverage.functions +
      unitCoverage.branches +
      unitCoverage.statements +
      integrationCoverage.lines +
      integrationCoverage.functions +
      integrationCoverage.branches +
      integrationCoverage.statements +
      e2eCoverage.lines +
      e2eCoverage.functions +
      e2eCoverage.branches +
      e2eCoverage.statements) /
      12,
  );

  lines.push(`🎯 Overall Coverage Score: ${overallScore}/100`);
  lines.push("");

  if (overallScore >= 85) {
    lines.push("✅ Excellent coverage across all layers!");
  } else if (overallScore >= 70) {
    lines.push("⚠️ Good coverage, but some areas need improvement");
  } else {
    lines.push("🔧 Coverage needs significant improvement");
  }

  return lines.join("\n");
}

function main() {
  try {
    const coveragePath = join(process.cwd(), "coverage", "coverage-final.json");

    if (!existsSync(coveragePath)) {
      console.log("Coverage report not found. Run tests with coverage first.");
      process.exit(1);
    }

    const coverageData = JSON.parse(readFileSync(coveragePath, "utf-8"));
    const layers = analyzeCoverageByLayer(coverageData);
    const report = generateCoverageReport(layers);

    console.log(report);
  } catch (error) {
    console.error("Error analyzing coverage:", error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
