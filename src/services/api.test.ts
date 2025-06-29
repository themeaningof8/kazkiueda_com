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
      const result = await getArticles()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
        expect(result.data[0]).toMatchObject({
          id: '1',
          title: 'React Testing Libraryの使い方',
          category: 'テクノロジー',
        })
        expect(result.data[1]).toMatchObject({
          id: '2',
          title: 'TypeScriptの型安全性',
          category: 'プログラミング',
        })
      }
    })

    it('サーバーエラー時に適切なエラーを返す', async () => {
      server.use(
        http.get('https://api.example.com/articles', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error', code: 'INTERNAL_ERROR' },
            { status: 500 }
          )
        })
      )

      const result = await getArticles()
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ApiErrorClass)
        expect(result.error.message).toBe('Internal Server Error')
        expect(result.error.status).toBe(500)
        expect(result.error.code).toBe('INTERNAL_ERROR')
      }
    })

    it('ネットワークエラー時に適切なエラーを返す', async () => {
      server.use(
        http.get('https://api.example.com/articles', () => {
          return HttpResponse.error()
        })
      )

      const result = await getArticles()
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ApiErrorClass)
        expect(result.error.message).toBe('Network error occurred')
        expect(result.error.status).toBe(0)
        expect(result.error.code).toBe('NETWORK_ERROR')
      }
    })
  })

  describe('getArticle', () => {
    it('特定の記事を正常に取得できる', async () => {
      const result = await getArticle('1')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toMatchObject({
          id: '1',
          title: 'React Testing Libraryの使い方',
          category: 'テクノロジー',
          content: expect.stringContaining('React Testing Library'),
        })
      }
    })

    it('存在しない記事IDでは404エラーを返す', async () => {
      const result = await getArticle('999')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ApiErrorClass)
        expect(result.error.status).toBe(404)
      }
    })
  })

  describe('getUserProfile', () => {
    it('ユーザー情報を正常に取得できる', async () => {
      const result = await getUserProfile()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toMatchObject({
          id: 'user-1',
          name: 'Kaz Kiueda',
          email: 'kaz@example.com',
          bio: expect.stringContaining('フロントエンド開発者'),
        })
      }
    })

    it('認証エラー時に適切なエラーを返す', async () => {
      server.use(
        http.get('https://api.example.com/user/profile', () => {
          return HttpResponse.json({ message: 'Unauthorized', code: 'AUTH_ERROR' }, { status: 401 })
        })
      )

      const result = await getUserProfile()
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ApiErrorClass)
        expect(result.error.status).toBe(401)
        expect(result.error.code).toBe('AUTH_ERROR')
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

      const result = await getArticles()
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ApiErrorClass)
        expect(result.error.message).toBe('Unknown error occurred')
        expect(result.error.status).toBe(500)
        expect(result.error.code).toBe('UNKNOWN_ERROR')
      }
    })
  })
})
