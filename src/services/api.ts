import type { ApiError, Article, User } from '@/types/api'

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
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
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

      throw new ApiErrorClass(errorData.message, response.status, errorData.code)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      throw error
    }

    // ネットワークエラーなどの場合
    throw new ApiErrorClass('Network error occurred', 0, 'NETWORK_ERROR')
  }
}

// 記事一覧を取得
export async function getArticles(): Promise<Article[]> {
  return fetchApi<Article[]>('/articles')
}

// 特定の記事を取得
export async function getArticle(id: string): Promise<Article> {
  return fetchApi<Article>(`/articles/${id}`)
}

// ユーザー情報を取得
export async function getUserProfile(): Promise<User> {
  return fetchApi<User>('/user/profile')
}

// 記事を検索
export async function searchArticles(query: string): Promise<Article[]> {
  const params = new URLSearchParams({ q: query })
  return fetchApi<Article[]>(`/articles/search?${params}`)
}
