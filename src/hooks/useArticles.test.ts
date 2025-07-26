import { renderHook, waitFor, act } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { server } from '@/mocks/server'

import { useArticles } from './useArticles'

// Markdownファイルのモックコンテンツ
const mockMarkdownPublished = `---
title: "React Testing Libraryの使い方"
description: "React Testing Libraryを使った効果的なテストの書き方について解説します。"
category: "テクノロジー"
publishedAt: "2024-01-15T10:00:00Z"
published: true
imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"
author:
  name: "田中太郎"
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
---

# React Testing Libraryの使い方

React Testing Libraryは、Reactコンポーネントをユーザーの視点でテストするためのライブラリです...`

const mockMarkdownPublished2 = `---
title: "TypeScriptの型安全性"
description: "TypeScriptを使った型安全なコードの書き方とベストプラクティス。"
category: "プログラミング"
publishedAt: "2024-01-10T14:30:00Z"
published: true
imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"
author:
  name: "佐藤花子"
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
---

# TypeScriptの型安全性

TypeScriptは、JavaScriptに静的型付けを追加したプログラミング言語です...`

const mockMarkdownDraft = `---
title: "Next.js 14の新機能（ドラフト）"
description: "Next.js 14で追加された新機能について詳しく解説します。"
category: "テクノロジー"
publishedAt: "2024-01-20T09:00:00Z"
published: false
imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"
author:
  name: "田中太郎"
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
---

# Next.js 14の新機能（ドラフト）

Next.js 14では、Server ActionsやTurbopackなどの新機能が追加されました...`

describe('useArticles', () => {
  beforeEach(() => {
    server.resetHandlers()
    
    // Markdownファイルの取得をモック
    server.use(
      http.get('/articles/2024-06-01-hello-world.md', () => {
        return HttpResponse.text(mockMarkdownPublished)
      }),
      http.get('/articles/2024-01-20-nextjs-draft.md', () => {
        return HttpResponse.text(mockMarkdownDraft)
      }),
      // 追加の公開記事（テスト用）
      http.get('/articles/typescript-safety.md', () => {
        return HttpResponse.text(mockMarkdownPublished2)
      })
    )
  })

  it('記事を正常に取得できる', async () => {
    const { result } = renderHook(() => useArticles())

    // 初期状態の確認
    expect(result.current.loading).toBe(true)
    expect(result.current.articles).toEqual([])
    expect(result.current.error).toBe(null)

    // データ取得完了まで待機
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // 取得されたデータの確認（公開記事のみ）
    expect(result.current.articles).toHaveLength(1)
    expect(result.current.articles[0]).toMatchObject({
      id: '2024-06-01-hello-world',
      title: 'React Testing Libraryの使い方',
      category: 'テクノロジー',
      published: true,
    })
    expect(result.current.error).toBe(null)
  })

  it('デフォルトで公開記事のみを取得する', async () => {
    const { result } = renderHook(() => useArticles())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // 公開記事のみが取得されることを確認
    expect(result.current.articles).toHaveLength(1)
    expect(result.current.articles.every(article => article.published)).toBe(true)
  })

  it('ドラフト記事も含めて取得できる', async () => {
    const { result } = renderHook(() => useArticles({ includeDrafts: true }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // 全記事（ドラフト含む）が取得されることを確認
    expect(result.current.articles).toHaveLength(2)
    const draftArticle = result.current.articles.find(article => !article.published)
    expect(draftArticle).toBeDefined()
    expect(draftArticle?.title).toBe('Next.js 14の新機能（ドラフト）')
  })

  it('includeDraftsオプションの変更で再取得される', async () => {
    const { result, rerender } = renderHook(
      ({ includeDrafts }: { includeDrafts?: boolean }) => useArticles({ includeDrafts }),
      { initialProps: { includeDrafts: false } }
    )

    // 初回取得（公開記事のみ）
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.articles).toHaveLength(1)

    // ドラフト記事も含めるオプションに変更
    rerender({ includeDrafts: true })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.articles).toHaveLength(2)
  })

  it('Markdownファイルが見つからない時にエラーメッセージが表示される', async () => {
    // 404エラーを返すハンドラーに置き換え
    server.use(
      http.get('/articles/2024-06-01-hello-world.md', () => {
        return new HttpResponse(null, { status: 404 })
      }),
      http.get('/articles/2024-01-20-nextjs-draft.md', () => {
        return new HttpResponse(null, { status: 404 })
      })
    )

    const { result } = renderHook(() => useArticles())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.articles).toEqual([])
    expect(result.current.error).toBe('記事一覧の取得に失敗しました')
  })

  it('ネットワークエラー時にデフォルトエラーメッセージが表示される', async () => {
    // ネットワークエラーをシミュレート
    server.use(
      http.get('/articles/2024-06-01-hello-world.md', () => {
        throw new Error('Network error')
      }),
      http.get('/articles/2024-01-20-nextjs-draft.md', () => {
        throw new Error('Network error')
      })
    )

    const { result } = renderHook(() => useArticles())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.articles).toEqual([])
    expect(result.current.error).toBe('記事一覧の取得に失敗しました')
  })

  it('refetch関数で再取得できる', async () => {
    const { result } = renderHook(() => useArticles())

    // 初回取得
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.articles).toHaveLength(1)

    // 空の結果を返すハンドラーに置き換え
    server.use(
      http.get('/articles/2024-06-01-hello-world.md', () => {
        return new HttpResponse(null, { status: 404 })
      }),
      http.get('/articles/2024-01-20-nextjs-draft.md', () => {
        return new HttpResponse(null, { status: 404 })
      })
    )

    // refetch実行
    await act(async () => {
      await result.current.refetch()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.articles).toEqual([])
    expect(result.current.error).toBe('記事一覧の取得に失敗しました')
  })

  it('refetch後に更新されたデータが表示される', async () => {
    const { result } = renderHook(() => useArticles())

    // 初回取得完了まで待機
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const initialTitle = result.current.articles[0]?.title
    expect(initialTitle).toBe('React Testing Libraryの使い方')

    // 更新されたMarkdownファイルをモック
    const updatedArticle = `---
title: "Updated Article Title"
description: "This article has been updated"
category: "更新済み"
publishedAt: "2024-01-25T10:00:00Z"
published: true
imageUrl: "https://example.com/image.jpg"
author:
  name: "Test Author"
  avatar: "https://example.com/avatar.jpg"
---

# Updated Article

This article has been updated.`
    
    server.use(
      http.get('/articles/2024-06-01-hello-world.md', () => {
        return HttpResponse.text(updatedArticle)
      }),
      http.get('/articles/2024-01-20-nextjs-draft.md', () => {
        return new HttpResponse(null, { status: 404 })
      })
    )

    // refetch実行
    await act(async () => {
      await result.current.refetch()
    })

    // 更新されたデータが表示されることを確認
    expect(result.current.loading).toBe(false)
    expect(result.current.articles).toHaveLength(1)
    expect(result.current.articles[0]).toMatchObject({
      id: '2024-06-01-hello-world',
      title: 'Updated Article Title',
      category: '更新済み',
      published: true,
    })
  })
})
