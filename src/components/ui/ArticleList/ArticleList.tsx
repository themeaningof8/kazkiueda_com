import { Alert } from '@/components/ui/Alert'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { Button } from '@/components/ui/Button'
import { useArticles } from '@/hooks/useArticles'

export function ArticleList() {
  const { articles, loading, error, refetch } = useArticles()

  if (loading) {
    return (
      <div role='status' aria-label='読み込み中' aria-busy='true' className='space-y-4'>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded w-1/4 mb-4'></div>
          <div className='space-y-4'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='border rounded-lg p-4'>
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                <div className='h-3 bg-gray-200 rounded w-1/2 mb-2'></div>
                <div className='h-32 bg-gray-200 rounded'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='font-semibold'>記事の読み込みに失敗しました</h3>
            <p className='text-sm'>{error}</p>
          </div>
          <Button onClick={refetch} variant='outline' size='sm'>
            再試行
          </Button>
        </div>
      </Alert>
    )
  }

  if (articles.length === 0) {
    return (
      <div className='text-center py-8'>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>記事が見つかりません</h3>
        <p className='text-gray-600 mb-4'>現在表示できる記事がありません。</p>
        <Button onClick={refetch} variant='outline'>
          再読み込み
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold text-gray-900'>記事一覧 ({articles.length}件)</h2>
        <Button onClick={refetch} variant='outline' size='sm'>
          更新
        </Button>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {articles.map(article => (
          <ArticleCard
            key={article.id}
            title={article.title}
            category={article.category}
            description={article.description}
            imageUrl={article.imageUrl}
            href={article.href}
          />
        ))}
      </div>
    </div>
  )
}
