#!/usr/bin/env bun

/**
 * Detect if a PR contains only dependency changes (package.json, lockfile)
 * Used in CI to determine if integration tests can be skipped
 *
 * Exit codes:
 * 0 - Dependency-only changes (safe to skip integration tests)
 * 1 - Contains code/config changes (run full tests)
 */

import { execSync } from "node:child_process";

interface ChangeAnalysis {
  isDependencyOnly: boolean;
  changedFiles: string[];
  hasCodeChanges: boolean;
  hasConfigChanges: boolean;
}

/**
 * Get list of changed files compared to base branch
 */
function getChangedFiles(): string[] {
  try {
    // In GitHub Actions, compare against the base branch
    const baseBranch = process.env.GITHUB_BASE_REF || "main";

    // Get list of changed files
    const output = execSync(`git diff --name-only origin/${baseBranch}...HEAD`, {
      encoding: "utf-8",
    });

    return output
      .split("\n")
      .filter((file) => file.trim().length > 0)
      .map((file) => file.trim());
  } catch (error) {
    console.error("Error getting changed files:", error);
    return [];
  }
}

/**
 * Analyze changed files to determine if they're dependency-only
 */
function analyzeChanges(files: string[]): ChangeAnalysis {
  const dependencyFiles = new Set([
    "package.json",
    "bun.lockb",
    "pnpm-lock.yaml",
    "yarn.lock",
    "package-lock.json",
  ]);

  // Files that are allowed to change alongside dependency updates
  const allowedNonCodeFiles = new Set([
    ".github/workflows/ci.yml", // May be updated by Renovate for workflow dependencies
    ".github/workflows/reusable-tests.yml",
  ]);

  const changedFiles = files;
  let hasCodeChanges = false;
  let hasConfigChanges = false;

  for (const file of changedFiles) {
    // Skip dependency files
    if (dependencyFiles.has(file)) {
      continue;
    }

    // Skip allowed non-code files
    if (allowedNonCodeFiles.has(file)) {
      continue;
    }

    // Check for code changes
    if (
      file.startsWith("src/") ||
      file.startsWith("tests/") ||
      file.startsWith("__tests__/") ||
      file.startsWith("scripts/") ||
      file.includes(".test.") ||
      file.includes(".spec.")
    ) {
      hasCodeChanges = true;
      break;
    }

    // Check for config changes
    if (
      file.endsWith(".config.ts") ||
      file.endsWith(".config.js") ||
      file.endsWith(".config.mjs") ||
      file === "tsconfig.json" ||
      file === "biome.json" ||
      file === "next.config.mjs" ||
      file === "tailwind.config.ts" ||
      file === "postcss.config.cjs"
    ) {
      hasConfigChanges = true;
      break;
    }

    // Any other file change is considered significant
    console.log(`Found non-dependency file change: ${file}`);
    hasCodeChanges = true;
    break;
  }

  const isDependencyOnly = !hasCodeChanges && !hasConfigChanges;

  return {
    isDependencyOnly,
    changedFiles,
    hasCodeChanges,
    hasConfigChanges,
  };
}

/**
 * Check if PR is from Renovate
 */
function isRenovatePR(): boolean {
  const headRef = process.env.GITHUB_HEAD_REF || "";
  return headRef.startsWith("renovate/");
}

/**
 * Main execution
 */
function main() {
  console.log("=== Dependency Change Detection ===");

  // Check if this is a Renovate PR
  if (!isRenovatePR()) {
    console.log("Not a Renovate PR - running full tests");
    process.exit(1);
  }

  console.log("Renovate PR detected - analyzing changes...");

  // Get changed files
  const changedFiles = getChangedFiles();

  if (changedFiles.length === 0) {
    console.log("No files changed - running full tests as safety measure");
    process.exit(1);
  }

  console.log(`Changed files (${changedFiles.length}):`);
  for (const file of changedFiles) {
    console.log(`  - ${file}`);
  }

  // Analyze changes
  const analysis = analyzeChanges(changedFiles);

  console.log("\nAnalysis results:");
  console.log(`  Dependency-only: ${analysis.isDependencyOnly}`);
  console.log(`  Has code changes: ${analysis.hasCodeChanges}`);
  console.log(`  Has config changes: ${analysis.hasConfigChanges}`);

  if (analysis.isDependencyOnly) {
    console.log("\n✓ Safe to skip integration tests");
    console.log("  (only dependency files changed)");
    process.exit(0);
  }

  console.log("\n✗ Running full tests");
  console.log("  (code or config changes detected)");
  process.exit(1);
}

main();
