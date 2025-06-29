import type { ApiError, Article, User } from '@/types/api'
import type { Result } from '@/types/result'

const API_BASE_URL = 'https://api.example.com'

// APIエラーのカスタムクラス
export class ApiErrorClass extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 基本的なfetch関数
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<Result<T, ApiErrorClass>> {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: 'Unknown error occurred',
        code: 'UNKNOWN_ERROR',
        status: response.status,
      }))

      return {
        success: false,
        error: new ApiErrorClass(errorData.message, response.status, errorData.code),
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return { success: false, error }
    }

    // ネットワークエラーなどの場合
    return {
      success: false,
      error: new ApiErrorClass('Network error occurred', 0, 'NETWORK_ERROR'),
    }
  }
}

// 記事一覧を取得
export async function getArticles(): Promise<Result<Article[], ApiErrorClass>> {
  return fetchApi<Article[]>('/articles')
}

// 特定の記事を取得
export async function getArticle(id: string): Promise<Result<Article, ApiErrorClass>> {
  return fetchApi<Article>(`/articles/${id}`)
}

// ユーザー情報を取得
export async function getUserProfile(): Promise<Result<User, ApiErrorClass>> {
  return fetchApi<User>('/user/profile')
}

// 記事を検索
export async function searchArticles(query: string): Promise<Result<Article[], ApiErrorClass>> {
  const params = new URLSearchParams({ q: query })
  return fetchApi<Article[]>(`/articles/search?${params}`)
}
