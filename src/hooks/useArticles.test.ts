import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { server } from '@/mocks/server'
import type { ApiError } from '@/types/api'

import { useArticles } from './useArticles'

describe('useArticles', () => {
  beforeEach(() => {
    // 各テストの前にハンドラーをリセット
    server.resetHandlers()
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

    // 取得されたデータの確認
    expect(result.current.articles).toHaveLength(2)
    expect(result.current.articles[0]).toMatchObject({
      id: '1',
      title: 'React Testing Libraryの使い方',
      category: 'テクノロジー',
    })
    expect(result.current.error).toBe(null)
  })

  it('APIエラー時にエラーメッセージが表示される', async () => {
    // エラーレスポンスを返すハンドラーに置き換え
    const errorResponse: ApiError = {
      message: 'サーバーエラーが発生しました',
      code: 'SERVER_ERROR',
      status: 500,
    }
    server.use(
      http.get('https://api.example.com/articles', () => {
        return HttpResponse.json(errorResponse, { status: 500 })
      })
    )

    const { result } = renderHook(() => useArticles())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.articles).toEqual([])
    expect(result.current.error).toBe('サーバーエラーが発生しました')
  })

  it('ネットワークエラー時にデフォルトエラーメッセージが表示される', async () => {
    // ネットワークエラーをシミュレート
    server.use(
      http.get('https://api.example.com/articles', () => {
        return HttpResponse.error()
      })
    )

    const { result } = renderHook(() => useArticles())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.articles).toEqual([])
    expect(result.current.error).toBe('Network error occurred')
  })

  it('refetch関数で再取得できる', async () => {
    const { result } = renderHook(() => useArticles())

    // 初回取得完了まで待機
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.articles).toHaveLength(2)

    // 空の配列を返すハンドラーに置き換え
    server.use(
      http.get('https://api.example.com/articles', () => {
        return HttpResponse.json([])
      })
    )

    // refetch実行
    act(() => {
      result.current.refetch()
    })

    // データが更新されるのを待つ
    await waitFor(() => {
      expect(result.current.articles).toEqual([])
    })

    // 最終的な状態を確認
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('refetch中はローディング状態になる', async () => {
    const { result } = renderHook(() => useArticles())

    // 初回取得完了まで待機
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // 遅延レスポンスのハンドラーに置き換え
    server.use(
      http.get('https://api.example.com/articles', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return HttpResponse.json(['new data'])
      })
    )

    // refetch実行（awaitしない）
    act(() => {
      result.current.refetch()
    })

    // ローディング状態の確認
    await waitFor(() => {
      expect(result.current.loading).toBe(true)
    })

    // refetch完了とデータ更新を待機
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.articles).toEqual(['new data'])
    })
  })
})
