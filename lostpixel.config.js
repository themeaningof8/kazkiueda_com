/** @type {import('lost-pixel').CustomProjectConfig} */
export default {
  // OSSモードを有効にする
  mode: 'oss',
  
  // Storybookでのビジュアル回帰テスト
  storybook: {
    storybookUrl: './storybook-static',
  },

  // 生成された画像のディレクトリ
  imagePathBaseline: './lost-pixel/baseline',
  imagePathCurrent: './lost-pixel/current',
  imagePathDifference: './lost-pixel/difference',

  // 比較設定
  threshold: 0.2,
  
  // ブラウザ設定
  browser: 'chromium',
  
  // Playwrightの設定
  playwright: {
    headless: true,
    viewport: {
      width: 1280,
      height: 720,
    },
  },

  // 並行実行数
  concurrency: 2,

  // 失敗時の動作
  failOnDifference: process.env.CI === 'true',

  // GitHub統合設定（OSSモード）
  github: {
    commitSha: process.env.GITHUB_SHA,
    repositoryOwner: process.env.GITHUB_REPOSITORY_OWNER,
    repositoryName: process.env.GITHUB_REPOSITORY?.split('/')[1],
    pullRequestId: process.env.GITHUB_PR_NUMBER,
  },

  // 除外するストーリー（必要に応じて）
  storybook_exclude: [
    // '**/*docs*', // Docsページを除外
  ],

  // カスタムマスク設定（動的コンテンツを隠すため）
  mask: [
    // 例: 日付やタイムスタンプなどの動的要素
    // { selector: '[data-testid="timestamp"]' },
  ],

  // ベースラインの自動アップデート（CI環境では無効）
  generateOnly: false,
}; 