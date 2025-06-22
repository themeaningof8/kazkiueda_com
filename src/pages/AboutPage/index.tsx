import { memo, useMemo } from 'react'

const AboutPage = memo(() => {
  const techStack = useMemo(
    () => [
      { name: 'React 19', description: 'UIライブラリ' },
      { name: 'TypeScript', description: '型安全性' },
      { name: 'React Router', description: 'ルーティング' },
      { name: 'TailwindCSS', description: 'ユーティリティファーストCSS' },
      { name: 'Vite', description: '高速ビルドツール' },
      { name: 'Bun', description: '高速パッケージマネージャー' },
      { name: 'oxlint', description: '高速リンター' },
      { name: 'Storybook', description: 'コンポーネント開発環境' },
    ],
    []
  )

  const techStackList = useMemo(
    () =>
      techStack.map((tech, index) => (
        <li key={index} className='text-muted-foreground'>
          • <strong>{tech.name}</strong> - {tech.description}
        </li>
      )),
    [techStack]
  )

  return (
    <div className='max-w-4xl mx-auto'>
      <h1 className='text-3xl font-bold tracking-tight mb-8'>About</h1>
      <div className='prose prose-gray dark:prose-invert max-w-none'>
        <p className='text-lg text-muted-foreground mb-6'>
          このアプリケーションは、モダンなReact開発環境のテンプレートです。
        </p>

        <h2 className='text-xl font-semibold mt-8 mb-4'>技術スタック</h2>
        <ul className='space-y-2'>{techStackList}</ul>

        <h2 className='text-xl font-semibold mt-8 mb-4'>プロジェクト構造</h2>
        <p className='text-muted-foreground'>
          react-bulletproofアーキテクチャに基づいたディレクトリ構造を採用し、
          スケーラブルで保守性の高いコードベースを目指しています。
        </p>
      </div>
    </div>
  )
})

AboutPage.displayName = 'AboutPage'

export default AboutPage
