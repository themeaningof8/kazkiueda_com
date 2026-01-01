// Playwright用のグローバルセットアップランナー
// bunまたはtsxで実行されるため、ESモジュールとして動作
import globalSetup from './global-setup';

// Playwrightから呼び出される場合は関数をエクスポート
export default globalSetup;

// 直接実行される場合は実行
if (import.meta.main || process.argv[1]?.endsWith('global-setup-runner.ts')) {
  globalSetup()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ グローバルセットアップでエラーが発生しました:', error);
      process.exit(1);
    });
}
