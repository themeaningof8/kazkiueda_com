---
title: "ポートフォリオサイト"
description: "Astro + React + TypeScriptで構築したポートフォリオ＆ブログサイト"
projectDate: 2024-01-01
completedDate: 2024-01-15
role: ["フロントエンド開発", "UI/UX設計", "コンテンツ設計"]
technologies: ["Astro", "React", "TypeScript", "Tailwind CSS", "Vitest", "GSAP"]
category: "web"
status: "completed"
featured: true
githubUrl: "https://github.com/themeaningof8/kazkiueda_com"
liveUrl: "https://kazkiueda.com"
order: 1
---

# プロジェクト概要

個人ポートフォリオサイトとブログを兼ねたWebサイトです。
モダンな技術スタックを採用し、パフォーマンスとDX（開発体験）を重視して構築しました。

## 技術的特徴

### フロントエンド
- **Astro 5.x** - 静的サイト生成とアイランドアーキテクチャ
- **React 19** - UIコンポーネント（必要最小限）
- **TypeScript** - 型安全性とDX向上
- **Tailwind CSS** - ユーティリティファーストCSS

### 品質管理
- **Vitest** - 高速テストランナー
- **ESLint** - コード品質チェック
- **Prettier** - コードフォーマット

### デプロイ・運用
- **Cloudflare Pages** - 高速CDN配信
- **GitHub Actions** - CI/CD
- **Google Analytics** - アクセス解析

## 実装のポイント

1. **パフォーマンス最適化**
   - アイランドアーキテクチャによる最小限のJS配信
   - 画像最適化とレスポンシブ対応
   - 初期レンダリング < 100ms達成

2. **開発体験の向上**
   - TypeScript strictモードによる型安全性
   - TDD開発環境（Vitest + Testing Library）
   - 自動テスト・品質チェック

3. **コンテンツ管理**
   - Content Collections による型安全なコンテンツ管理
   - Markdownベースの記事作成
   - 自動生成される型定義

## 今後の展開

- 検索機能の実装
- コメント機能の追加
- 多言語対応
- パフォーマンス監視の強化 