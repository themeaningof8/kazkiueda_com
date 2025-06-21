export default function HomePage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] text-center'>
      <h1 className='text-4xl font-bold tracking-tight sm:text-6xl'>Welcome to Kazk Iueda</h1>
      <p className='mt-6 text-lg leading-8 text-muted-foreground max-w-2xl'>
        Reactアプリケーションテンプレートへようこそ。TailwindCSS、React Router、
        TypeScript、Storybook、oxlintを使用したモダンな開発環境です。
      </p>
      <div className='mt-10 flex items-center justify-center gap-x-6'>
        <a
          href='/about'
          className='rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary'
        >
          詳細を見る
        </a>
        <a
          href='https://github.com'
          className='text-sm font-semibold leading-6 text-foreground hover:text-primary'
        >
          GitHub <span aria-hidden='true'>→</span>
        </a>
      </div>
    </div>
  )
}
