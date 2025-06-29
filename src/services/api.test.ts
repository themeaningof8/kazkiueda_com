import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { server } from '@/mocks/server'

import { ApiErrorClass, getArticle, getArticles, getUserProfile } from './api'

describe('API Service', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  describe('getArticles', () => {
    it('記事一覧を正常に取得できる', async () => {
      const articles = await getArticles()

      expect(articles).toHaveLength(2)
      expect(articles[0]).toMatchObject({
        id: '1',
        title: 'React Testing Libraryの使い方',
        category: 'テクノロジー',
      })
      expect(articles[1]).toMatchObject({
        id: '2',
        title: 'TypeScriptの型安全性',
        category: 'プログラミング',
      })
    })

    it('サーバーエラー時に適切なエラーを投げる', async () => {
      server.use(
        http.get('https://api.example.com/articles', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error', code: 'INTERNAL_ERROR' },
            { status: 500 }
          )
        })
      )

      await expect(getArticles()).rejects.toThrow(ApiErrorClass)

      try {
        await getArticles()
      } catch (error) {
        expect(error).toBeInstanceOf(ApiErrorClass)
        expect((error as ApiErrorClass).message).toBe('Internal Server Error')
        expect((error as ApiErrorClass).status).toBe(500)
        expect((error as ApiErrorClass).code).toBe('INTERNAL_ERROR')
      }
    })

    it('ネットワークエラー時に適切なエラーを投げる', async () => {
      server.use(
        http.get('https://api.example.com/articles', () => {
          return HttpResponse.error()
        })
      )

      await expect(getArticles()).rejects.toThrow(ApiErrorClass)

      try {
        await getArticles()
      } catch (error) {
        expect(error).toBeInstanceOf(ApiErrorClass)
        expect((error as ApiErrorClass).message).toBe('Network error occurred')
        expect((error as ApiErrorClass).status).toBe(0)
        expect((error as ApiErrorClass).code).toBe('NETWORK_ERROR')
      }
    })
  })

  describe('getArticle', () => {
    it('特定の記事を正常に取得できる', async () => {
      const article = await getArticle('1')

      expect(article).toMatchObject({
        id: '1',
        title: 'React Testing Libraryの使い方',
        category: 'テクノロジー',
        content: expect.stringContaining('React Testing Library'),
      })
    })

    it('存在しない記事IDでは404エラーを投げる', async () => {
      await expect(getArticle('999')).rejects.toThrow(ApiErrorClass)

      try {
        await getArticle('999')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiErrorClass)
        expect((error as ApiErrorClass).status).toBe(404)
      }
    })
  })

  describe('getUserProfile', () => {
    it('ユーザー情報を正常に取得できる', async () => {
      const user = await getUserProfile()

      expect(user).toMatchObject({
        id: 'user-1',
        name: 'Kaz Kiueda',
        email: 'kaz@example.com',
        bio: expect.stringContaining('フロントエンド開発者'),
      })
    })

    it('認証エラー時に適切なエラーを投げる', async () => {
      server.use(
        http.get('https://api.example.com/user/profile', () => {
          return HttpResponse.json({ message: 'Unauthorized', code: 'AUTH_ERROR' }, { status: 401 })
        })
      )

      await expect(getUserProfile()).rejects.toThrow(ApiErrorClass)

      try {
        await getUserProfile()
      } catch (error) {
        expect(error).toBeInstanceOf(ApiErrorClass)
        expect((error as ApiErrorClass).status).toBe(401)
        expect((error as ApiErrorClass).code).toBe('AUTH_ERROR')
      }
    })
  })

  describe('エラーハンドリング', () => {
    it('不正なJSONレスポンスでもエラーを適切に処理する', async () => {
      server.use(
        http.get('https://api.example.com/articles', () => {
          return new HttpResponse('Invalid JSON', {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        })
      )

      await expect(getArticles()).rejects.toThrow(ApiErrorClass)

      try {
        await getArticles()
      } catch (error) {
        expect(error).toBeInstanceOf(ApiErrorClass)
        expect((error as ApiErrorClass).message).toBe('Unknown error occurred')
        expect((error as ApiErrorClass).status).toBe(500)
        expect((error as ApiErrorClass).code).toBe('UNKNOWN_ERROR')
      }
    })
  })
})
