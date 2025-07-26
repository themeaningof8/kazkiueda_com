import matter from 'gray-matter'

import type { ApiError, Article, MarkdownArticle, MarkdownFrontMatter, User } from '@/types/api'
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
export async function getArticles(options?: {
  includeDrafts?: boolean
}): Promise<Result<Article[], ApiErrorClass>> {
  const result = await fetchApi<Article[]>('/articles')

  if (result.success) {
    // publishedフィルタリング
    const filteredArticles = options?.includeDrafts
      ? result.data
      : result.data.filter(article => article.published)

    return { success: true, data: filteredArticles }
  }

  return result
}

// 特定の記事を取得
export async function getArticle(id: string): Promise<Result<Article, ApiErrorClass>> {
  return fetchApi<Article>(`/articles/${id}`)
}

// 公開記事のみを取得
export async function getPublishedArticles(): Promise<Result<Article[], ApiErrorClass>> {
  return getMarkdownArticles({ includeDrafts: false })
}

// ドラフト記事を含めて取得
export async function getAllArticles(): Promise<Result<Article[], ApiErrorClass>> {
  return getMarkdownArticles({ includeDrafts: true })
}

// 個別記事をスラッグで取得
export async function getMarkdownArticle(slug: string): Promise<Result<Article, ApiErrorClass>> {
  const result = await fetchMarkdownFile(slug)
  
  if (result.success) {
    const article = markdownToArticle(result.data)
    return { success: true, data: article }
  } else {
    return result
  }
}

// 記事の公開状態を更新
export async function updateArticlePublishStatus(
  articleId: string,
  published: boolean
): Promise<Result<Article, ApiErrorClass>> {
  return fetchApi<Article>(`/articles/${articleId}/publish`, {
    method: 'PATCH',
    body: JSON.stringify({ published }),
  })
}

// 記事を公開する
export async function publishArticle(articleId: string): Promise<Result<Article, ApiErrorClass>> {
  return updateArticlePublishStatus(articleId, true)
}

// 記事を非公開（ドラフト）にする
export async function unpublishArticle(articleId: string): Promise<Result<Article, ApiErrorClass>> {
  return updateArticlePublishStatus(articleId, false)
}

// Markdownファイルから記事を読み込む
async function fetchMarkdownFile(slug: string): Promise<Result<MarkdownArticle, ApiErrorClass>> {
  try {
    const url = `/articles/${slug}.md`
    const response = await fetch(url)

    if (!response.ok) {
      return {
        success: false,
        error: new ApiErrorClass('記事が見つかりません', response.status, 'NOT_FOUND'),
      }
    }

    const markdownContent = await response.text()
    const { data: frontMatter, content } = matter(markdownContent)

    return {
      success: true,
      data: {
        slug,
        frontMatter: frontMatter as MarkdownFrontMatter,
        content,
      },
    }
  } catch (err) {
    return {
      success: false,
      error: new ApiErrorClass('記事の読み込みに失敗しました', 0, 'FETCH_ERROR'),
    }
  }
}

// MarkdownファイルをArticle型に変換
function markdownToArticle(markdown: MarkdownArticle): Article {
  const { slug, frontMatter, content } = markdown

  return {
    id: slug,
    title: frontMatter.title,
    category: frontMatter.category,
    description: frontMatter.description,
    content,
    imageUrl:
      frontMatter.imageUrl ||
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
    href: `/articles/${slug}`,
    publishedAt: frontMatter.publishedAt,
    published: frontMatter.published,
    author: frontMatter.author || {
      name: 'Kaz Kiueda',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  }
}

// 利用可能な記事スラッグ一覧（実際の実装では動的に取得）
const availableArticleSlugs = ['2024-06-01-hello-world', '2024-01-20-nextjs-draft']

// Markdownベースの記事一覧取得
export async function getMarkdownArticles(options?: {
  includeDrafts?: boolean
}): Promise<Result<Article[], ApiErrorClass>> {
  try {
    const articlePromises = availableArticleSlugs.map(slug => fetchMarkdownFile(slug))
    const markdownResults = await Promise.all(articlePromises)
    
    const articles: Article[] = []
    let hasErrors = false
    
    for (const result of markdownResults) {
      if (result.success) {
        const article = markdownToArticle(result.data)
        
        // publishedフィルタリング
        if (options?.includeDrafts || article.published) {
          articles.push(article)
        }
      } else {
        // 個別の記事取得エラーがある場合、全体エラーとして扱う
        hasErrors = true
      }
    }
    
    // エラーがある場合は全体エラーを返す
    if (hasErrors && articles.length === 0) {
      return {
        success: false,
        error: new ApiErrorClass('記事一覧の取得に失敗しました', 0, 'FETCH_ERROR')
      }
    }
    
    // 公開日でソート（新しい順）
    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    
    return { success: true, data: articles }
  } catch {
    return {
      success: false,
      error: new ApiErrorClass('記事一覧の取得に失敗しました', 0, 'FETCH_ERROR')
    }
  }
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
