import { HttpResponse, http } from 'msw'

// APIのベースURL（実際のAPIエンドポイントに合わせて調整してください）
const API_BASE_URL = 'https://api.example.com'

export const handlers = [
  // 記事一覧の取得
  http.get(`${API_BASE_URL}/articles`, () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'React Testing Libraryの使い方',
        category: 'テクノロジー',
        description: 'React Testing Libraryを使った効果的なテストの書き方について解説します。',
        imageUrl:
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
        href: '/articles/react-testing-library',
        publishedAt: '2024-01-15T10:00:00Z',
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
        imageUrl:
          'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
        href: '/articles/typescript-type-safety',
        publishedAt: '2024-01-10T14:30:00Z',
        author: {
          name: '佐藤花子',
          avatar:
            'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
    ])
  }),

  // 特定の記事の取得
  http.get(`${API_BASE_URL}/articles/:id`, ({ params }) => {
    const { id } = params

    const articles = {
      '1': {
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
        author: {
          name: '田中太郎',
          avatar:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
      '2': {
        id: '2',
        title: 'TypeScriptの型安全性',
        category: 'プログラミング',
        description: 'TypeScriptを使った型安全なコードの書き方とベストプラクティス。',
        content: 'TypeScriptは、JavaScriptに静的型付けを追加したプログラミング言語です...',
        imageUrl:
          'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
        href: '/articles/typescript-type-safety',
        publishedAt: '2024-01-10T14:30:00Z',
        author: {
          name: '佐藤花子',
          avatar:
            'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
    }

    const article = articles[id as keyof typeof articles]

    if (!article) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(article)
  }),

  // ユーザー情報の取得
  http.get(`${API_BASE_URL}/user/profile`, () => {
    return HttpResponse.json({
      id: 'user-1',
      name: 'Kaz Kiueda',
      email: 'kaz@example.com',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      bio: 'フロントエンド開発者として、ユーザー体験の向上に取り組んでいます。',
      location: '東京, 日本',
      website: 'https://kazkiueda.com',
    })
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
