import { useEffect, useState } from 'react'

import { getMarkdownArticles } from '@/services/api'
import type { Article } from '@/types/api'

interface UseArticlesOptions {
  includeDrafts?: boolean
}

interface UseArticlesReturn {
  articles: Article[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useArticles(options?: UseArticlesOptions): UseArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArticles = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await getMarkdownArticles({
        includeDrafts: options?.includeDrafts ?? false,
      })

      if (result.success) {
        setArticles(result.data)
        setError(null)
      } else {
        setError(result.error.message)
        setArticles([])
      }
    } catch (err) {
      setError('記事一覧の取得に失敗しました')
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [options?.includeDrafts])

  return {
    articles,
    loading,
    error,
    refetch: fetchArticles,
  }
}
