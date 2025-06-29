import { useEffect, useState } from 'react'

import { getArticles } from '@/services/api'
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
    setLoading(true)
    setError(null)
    const result = await getArticles()

    if (result.success) {
      setArticles(result.data)
    } else {
      setError(result.error.message)
    }
    setLoading(false)
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
