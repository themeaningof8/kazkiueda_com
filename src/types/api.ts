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
  published: boolean
  author: Author
}

// Markdownファイルのフロントマター型定義
export interface MarkdownFrontMatter {
  title: string
  description: string
  category: string
  publishedAt: string
  published: boolean
  imageUrl?: string
  author?: {
    name: string
    avatar: string
  }
}

// Markdownファイル全体の型定義
export interface MarkdownArticle {
  slug: string
  frontMatter: MarkdownFrontMatter
  content: string
}

// 著者の型定義
export interface Author {
  name: string
  avatar: string
}
