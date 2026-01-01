// Playwright用のグローバルティアダウンランナー
// bunまたはtsxで実行されるため、ESモジュールとして動作
import globalTeardown from "./global-teardown";

// Playwrightから呼び出される場合は関数をエクスポート
export default globalTeardown;

// 直接実行される場合は実行
if (import.meta.main || process.argv[1]?.endsWith("global-teardown-runner.ts")) {
  globalTeardown()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ グローバルティアダウンでエラーが発生しました:", error);
      process.exit(1);
    });
}
