import { HttpResponse, http } from 'msw'

export const handlers = [
  // Markdown記事ファイルのモック
  http.get('/articles/2024-06-01-hello-world.md', () => {
    return new HttpResponse(null, { status: 404 })
  }),

  http.get('/articles/2024-01-20-nextjs-draft.md', () => {
    return new HttpResponse(null, { status: 404 })
  }),

  http.get('/articles/2024-01-10-typescript-safety.md', () => {
    return new HttpResponse(null, { status: 404 })
  }),

  // ドラフト記事のモック（必要に応じて）
  http.get('/articles/draft-nextjs-14.md', () => {
    return HttpResponse.text(`---
title: Next.js 14の新機能（ドラフト）
category: テクノロジー
description: Next.js 14で追加された新機能について詳しく解説します。
publishedAt: 2024-01-20T10:00:00Z
published: false
author:
  name: 開発者
  avatar: https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80
imageUrl: https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80
---

# Next.js 14の新機能（ドラフト）

Next.js 14では、Server ActionsやTurbopackなどの新機能が追加されました...`)
  }),

  // エラーテスト用：存在しない記事
  http.get('/articles/nonexistent-article.md', () => {
    return new HttpResponse(null, { status: 404 })
  }),
]
