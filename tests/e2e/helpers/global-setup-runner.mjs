// Playwright用のグローバルセットアップランナー（.mjs拡張子でESモジュールとして実行）

import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// tsxを使ってglobal-setup-runner.tsを実行する関数
async function globalSetup() {
  const setupScript = join(__dirname, "global-setup-runner.ts");
  try {
    execSync(`npx tsx ${setupScript}`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    console.error("❌ グローバルセットアップでエラーが発生しました:", error);
    throw error;
  }
}

export default globalSetup;
