export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">About</h1>
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          このアプリケーションは、モダンなReact開発環境のテンプレートです。
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">技術スタック</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>• <strong>React 19</strong> - UIライブラリ</li>
          <li>• <strong>TypeScript</strong> - 型安全性</li>
          <li>• <strong>React Router</strong> - ルーティング</li>
          <li>• <strong>TailwindCSS</strong> - ユーティリティファーストCSS</li>
          <li>• <strong>Vite</strong> - 高速ビルドツール</li>
          <li>• <strong>Bun</strong> - 高速パッケージマネージャー</li>
          <li>• <strong>oxlint</strong> - 高速リンター</li>
          <li>• <strong>Storybook</strong> - コンポーネント開発環境</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">プロジェクト構造</h2>
        <p className="text-muted-foreground">
          react-bulletproofアーキテクチャに基づいたディレクトリ構造を採用し、
          スケーラブルで保守性の高いコードベースを目指しています。
        </p>
      </div>
    </div>
  )
} 