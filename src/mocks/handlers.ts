import { HttpResponse, http } from 'msw'

import type { Article, User } from '@/types/api'

// APIのベースURL（実際のAPIエンドポイントに合わせて調整してください）
const API_BASE_URL = 'https://api.example.com'

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'React Testing Libraryの使い方',
    category: 'テクノロジー',
    description: 'React Testing Libraryを使った効果的なテストの書き方について解説します。',
    content:
      'React Testing Libraryは、Reactコンポーネントをユーザーの視点でテストするためのライブラリです...',
    imageUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
    href: '/articles/react-testing-library',
    publishedAt: '2024-01-15T10:00:00Z',
    published: true,
    author: {
      name: '田中太郎',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    id: '2',
    title: 'TypeScriptの型安全性',
    category: 'プログラミング',
    description: 'TypeScriptを使った型安全なコードの書き方とベストプラクティス。',
    content: 'TypeScriptは、JavaScriptに静的型付けを追加したプログラミング言語です...',
    imageUrl:
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
    href: '/articles/typescript-type-safety',
    publishedAt: '2024-01-10T14:30:00Z',
    published: true,
    author: {
      name: '佐藤花子',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    id: '3',
    title: 'Next.js 14の新機能（ドラフト）',
    category: 'テクノロジー',
    description: 'Next.js 14で追加された新機能について詳しく解説します。',
    content: 'Next.js 14では、Server ActionsやTurbopackなどの新機能が追加されました...',
    imageUrl:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
    href: '/articles/nextjs-14-features',
    publishedAt: '2024-01-20T09:00:00Z',
    published: false,
    author: {
      name: '田中太郎',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
]

const mockUser: User = {
  id: 'user-1',
  name: 'Kaz Kiueda',
  email: 'kaz@example.com',
  avatar:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  bio: 'フロントエンド開発者として、ユーザー体験の向上に取り組んでいます。',
  location: '東京, 日本',
  website: 'https://kazkiueda.com',
}

export const handlers = [
  // 記事一覧の取得
  http.get(`${API_BASE_URL}/articles`, () => {
    return HttpResponse.json(mockArticles)
  }),

  // 特定の記事の取得
  http.get(`${API_BASE_URL}/articles/:id`, ({ params }) => {
    const { id } = params
    const article = mockArticles.find(a => a.id === id)

    if (!article) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(article)
  }),

  // ユーザー情報の取得
  http.get(`${API_BASE_URL}/user/profile`, () => {
    return HttpResponse.json(mockUser)
  }),

  // エラーケースのテスト用
  http.get(`${API_BASE_URL}/articles/error`, () => {
    return new HttpResponse(null, { status: 500 })
  }),

  // 遅延レスポンスのテスト用
  http.get(`${API_BASE_URL}/articles/slow`, async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return HttpResponse.json([])
  }),
]
