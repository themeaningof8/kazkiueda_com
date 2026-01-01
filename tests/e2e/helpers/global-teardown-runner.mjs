// Playwright用のグローバルティアダウンランナー（.mjs拡張子でESモジュールとして実行）

import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// tsxを使ってglobal-teardown-runner.tsを実行する関数
async function globalTeardown() {
  const teardownScript = join(__dirname, "global-teardown-runner.ts");
  try {
    execSync(`npx tsx ${teardownScript}`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    console.error("❌ グローバルティアダウンでエラーが発生しました:", error);
    throw error;
  }
}

export default globalTeardown;
