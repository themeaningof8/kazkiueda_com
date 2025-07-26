import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { getMarkdownArticle } from '@/services/api'
import type { Article } from '@/types/api'

import { Article as ArticleComponent } from './Article'

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setError('記事が見つかりません')
      setLoading(false)
      return
    }

    const fetchArticle = async () => {
      setLoading(true)
      setError(null)

      const result = await getMarkdownArticle(slug)

      if (result.success) {
        // 未公開記事は表示しない（管理者権限等のチェックを追加可能）
        if (!result.data.published) {
          setError('この記事は現在公開されていません')
        } else {
          setArticle(result.data)
        }
      } else {
        setError(result.error.message)
      }
      setLoading(false)
    }

    fetchArticle()
  }, [slug])

  if (loading) {
    return (
      <div className='max-w-4xl mx-auto px-6 py-8'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-3/4'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2'></div>
          <div className='space-y-2'>
            <div className='h-4 bg-gray-200 rounded'></div>
            <div className='h-4 bg-gray-200 rounded'></div>
            <div className='h-4 bg-gray-200 rounded w-5/6'></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='max-w-4xl mx-auto px-6 py-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-red-600 mb-4'>エラー</h1>
          <p className='text-gray-600'>{error}</p>
        </div>
      </div>
    )
  }

  if (!article) return null

  return (
    <div className='max-w-4xl mx-auto px-6 py-8'>
      <article className='prose prose-lg dark:prose-invert max-w-none'>
        {/* 記事のメタ情報 */}
        <div className='not-prose mb-8'>
          <h1 className='text-3xl font-bold tracking-tight mb-4'>{article.title}</h1>
          <div className='flex items-center gap-4 text-sm text-gray-600 mb-6'>
            <span className='bg-primary/10 text-primary px-3 py-1 rounded-full font-medium'>
              {article.category}
            </span>
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
            </time>
            <div className='flex items-center gap-2'>
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className='w-6 h-6 rounded-full'
              />
              <span>{article.author.name}</span>
            </div>
            {!article.published && (
              <span className='bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium'>
                ドラフト
              </span>
            )}
          </div>
        </div>

        {/* 記事本文 */}
        <ArticleComponent content={article.content || ''} />
      </article>
    </div>
  )
}

export default ArticlePage
