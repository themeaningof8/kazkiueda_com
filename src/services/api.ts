import matter from 'gray-matter'

import type { Article, MarkdownArticle, MarkdownFrontMatter } from '@/types/api'
import type { Result } from '@/types/result'

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

// 公開記事のみを取得
export async function getPublishedArticles(): Promise<Result<Article[], ApiErrorClass>> {
  return getMarkdownArticles({ includeDrafts: false })
}

// ドラフト記事を含めて取得
export async function getAllArticles(): Promise<Result<Article[], ApiErrorClass>> {
  return getMarkdownArticles({ includeDrafts: true })
}

// 短縮されたslugからフルslugを見つける関数
function findFullSlugFromShortSlug(shortSlug: string): string | null {
  return (
    availableArticleSlugs.find(slug => slug.replace(/^\d{4}-\d{2}-\d{2}-/, '') === shortSlug) ||
    null
  )
}

// 個別記事をスラッグで取得
export async function getMarkdownArticle(slug: string): Promise<Result<Article, ApiErrorClass>> {
  // 短縮slugの場合は、フルslugを取得
  const fullSlug =
    slug.includes('-') && slug.match(/^\d{4}-\d{2}-\d{2}-/) ? slug : findFullSlugFromShortSlug(slug)

  if (!fullSlug) {
    return {
      success: false,
      error: new ApiErrorClass('記事が見つかりません', 404, 'NOT_FOUND'),
    }
  }

  const result = await fetchMarkdownFile(fullSlug)

  if (result.success) {
    const article = markdownToArticle(result.data)
    return { success: true, data: article }
  } else {
    return result
  }
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
    console.error('記事の読み込みでエラーが発生しました:', err)
    return {
      success: false,
      error: new ApiErrorClass('記事の読み込みに失敗しました', 0, 'FETCH_ERROR'),
    }
  }
}

// MarkdownファイルをArticle型に変換
function markdownToArticle(markdown: MarkdownArticle): Article {
  const { slug, frontMatter, content } = markdown

  // スラッグを短縮（日付プレフィックスを除去）
  const shortSlug = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '')

  return {
    id: slug,
    title: frontMatter.title,
    category: frontMatter.category,
    description: frontMatter.description,
    content,
    imageUrl:
      frontMatter.imageUrl ||
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
    href: `/articles/${shortSlug}`,
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
        error: new ApiErrorClass('記事一覧の取得に失敗しました', 0, 'FETCH_ERROR'),
      }
    }

    // 公開日でソート（新しい順）
    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    return { success: true, data: articles }
  } catch {
    return {
      success: false,
      error: new ApiErrorClass('記事一覧の取得に失敗しました', 0, 'FETCH_ERROR'),
    }
  }
}
