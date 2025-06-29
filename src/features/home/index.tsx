import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'

const HomePage = memo(() => {
  const heroContent = useMemo(
    () => ({
      title: 'Welcome to Kazk Iueda',
      description:
        'Reactアプリケーションテンプレートへようこそ。TailwindCSS、React Router、TypeScript、Storybook、oxlintを使用したモダンな開発環境です。',
      actions: [
        { href: '/about', label: '詳細を見る', primary: true },
        { href: 'https://github.com', label: 'GitHub', primary: false },
      ],
    }),
    []
  )

  const actionButtons = useMemo(
    () =>
      heroContent.actions.map((action, index) =>
        action.primary ? (
          <Button key={index} asChild>
            <Link to={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <a
            key={index}
            href={action.href}
            className='text-sm font-semibold leading-6 text-foreground hover:text-primary'
          >
            {action.label} <span aria-hidden='true'>→</span>
          </a>
        )
      ),
    [heroContent.actions]
  )

  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] text-center'>
      <h1 className='text-4xl font-bold tracking-tight sm:text-6xl'>{heroContent.title}</h1>
      <p className='mt-6 text-lg leading-8 text-muted-foreground max-w-2xl'>
        {heroContent.description}
      </p>
      <div className='mt-10 flex items-center justify-center gap-x-6'>{actionButtons}</div>
    </div>
  )
})

HomePage.displayName = 'HomePage'

export default HomePage
