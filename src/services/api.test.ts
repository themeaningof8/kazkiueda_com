import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { server } from '@/mocks/server'

import { ApiErrorClass, getAllArticles, getMarkdownArticle, getPublishedArticles } from './api'

describe('API Service', () => {
  beforeEach(() => {
    server.resetHandlers()

    // Markdownファイルのモックハンドラーを追加
    server.use(
      http.get('/articles/2024-06-01-hello-world.md', () => {
        return HttpResponse.text(`---
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

React Testing Libraryは、Reactコンポーネントをユーザーの視点でテストするためのライブラリです...`)
      }),
      http.get('/articles/2024-01-20-nextjs-draft.md', () => {
        return HttpResponse.text(`---
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

Next.js 14では、Server ActionsやTurbopackなどの新機能が追加されました...`)
      })
    )
  })

  describe('getPublishedArticles', () => {
    it('公開済みの記事のみを取得できる', async () => {
      const result = await getPublishedArticles()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
        expect(result.data.every(article => article.published)).toBe(true)
        expect(result.data[0]?.title).toBe('React Testing Libraryの使い方')
        expect(result.data[0]?.href).toBe('/articles/hello-world')
      }
    })

    it('記事の取得に失敗した場合、エラーを返す', async () => {
      server.use(
        http.get('/articles/2024-06-01-hello-world.md', () => {
          return new HttpResponse(null, { status: 500 })
        }),
        http.get('/articles/2024-01-20-nextjs-draft.md', () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      const result = await getPublishedArticles()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ApiErrorClass)
        expect(result.error.message).toBe('記事一覧の取得に失敗しました')
      }
    })
  })

  describe('getAllArticles', () => {
    it('公開済みとドラフト記事を含む全ての記事を取得できる', async () => {
      const result = await getAllArticles()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
        expect(result.data.some(article => article.published)).toBe(true)
        expect(result.data.some(article => !article.published)).toBe(true)
        const draftArticle = result.data.find(
          article => article.title === 'Next.js 14の新機能（ドラフト）'
        )
        expect(draftArticle).toBeDefined()
      }
    })
  })

  describe('getMarkdownArticle', () => {
    it('指定されたスラッグの記事を取得できる', async () => {
      const result = await getMarkdownArticle('2024-06-01-hello-world')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe('React Testing Libraryの使い方')
        expect(result.data.category).toBe('テクノロジー')
        expect(result.data.published).toBe(true)
        expect(result.data.content).toContain(
          'React Testing Libraryは、Reactコンポーネントをユーザーの視点でテストするためのライブラリです'
        )
      }
    })

    it('短縮スラッグで記事を取得できる', async () => {
      const result = await getMarkdownArticle('hello-world')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe('React Testing Libraryの使い方')
        expect(result.data.category).toBe('テクノロジー')
        expect(result.data.published).toBe(true)
      }
    })

    it('存在しない記事を取得しようとした場合、NOT_FOUNDエラーを返す', async () => {
      server.use(
        http.get('/articles/non-existent.md', () => {
          return new HttpResponse(null, { status: 404 })
        })
      )

      const result = await getMarkdownArticle('non-existent')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ApiErrorClass)
        expect(result.error.code).toBe('NOT_FOUND')
        expect(result.error.message).toBe('記事が見つかりません')
      }
    })
  })

  describe('ApiErrorClass', () => {
    it('APIエラーの詳細情報を保持する', () => {
      const error = new ApiErrorClass('テストエラー', 404, 'NOT_FOUND')

      expect(error.message).toBe('テストエラー')
      expect(error.status).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
      expect(error.name).toBe('ApiError')
      expect(error).toBeInstanceOf(Error)
    })
  })
})
