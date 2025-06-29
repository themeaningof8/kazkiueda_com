// 記事の型定義
export interface Article {
  id: string
  title: string
  category: string
  description: string
  content?: string
  imageUrl: string
  href: string
  publishedAt: string
  author: Author
}

// 著者の型定義
export interface Author {
  name: string
  avatar: string
}

// ユーザーの型定義
export interface User {
  id: string
  name: string
  email: string
  avatar: string
  bio: string
  location: string
  website: string
}

// APIレスポンスの型定義
export interface ArticlesResponse {
  articles: Article[]
  total: number
  page: number
  limit: number
}

// エラーレスポンスの型定義
export interface ApiError {
  message: string
  code: string
  status: number
}
