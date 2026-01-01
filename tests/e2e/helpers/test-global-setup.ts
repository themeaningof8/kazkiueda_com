// グローバルセットアップのテスト実行用スクリプト
import globalSetup from "./global-setup";

globalSetup()
  .then(() => {
    console.log("✅ グローバルセットアップが正常に完了しました");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ グローバルセットアップでエラーが発生しました:", error);
    process.exit(1);
  });
