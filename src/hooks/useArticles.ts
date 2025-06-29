import { useEffect, useState } from 'react'

import { ApiErrorClass, getArticles } from '@/services/api'
import type { Article } from '@/types/api'

interface UseArticlesReturn {
  articles: Article[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useArticles(): UseArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArticles = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getArticles()
      setArticles(data)
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message)
      } else {
        setError('記事の取得に失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  return {
    articles,
    loading,
    error,
    refetch: fetchArticles,
  }
}
