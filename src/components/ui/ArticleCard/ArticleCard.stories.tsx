import type { Meta, StoryObj } from '@storybook/react'
import { ArticleCard } from './ArticleCard'

const meta: Meta<typeof ArticleCard> = {
  title: 'UI/ArticleCard',
  component: ArticleCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    categoryVariant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
    isExternal: {
      control: 'boolean',
    },
    layout: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    aspectRatio: {
      control: { type: 'number', min: 0.1, max: 5, step: 0.1 },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'React 18の新機能を詳しく解説',
    category: 'フロントエンド',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
    href: '/articles/react-18-features',
    description: 'React 18で追加された新しい機能について、実際のコード例と共に詳しく解説します。',
  },
}

export const WithPublicImage: Story = {
  args: {
    title: 'TypeScriptベストプラクティス',
    category: '開発',
    imageUrl: '/placeholder-image.jpg', // publicディレクトリの画像例
    href: '/articles/typescript-best-practices',
    description: 'TypeScriptを使った開発でのベストプラクティスをまとめました。',
    categoryVariant: 'outline',
  },
}

export const ExternalLink: Story = {
  args: {
    title: 'Qiitaで書いた記事',
    category: 'エンジニアリング',
    imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
    href: 'https://qiita.com/example',
    isExternal: true,
    description: 'Qiitaに投稿した技術記事です。外部リンクとして開きます。',
    categoryVariant: 'default',
  },
}

export const LongTitle: Story = {
  args: {
    title: 'とても長いタイトルの記事：モダンなWebアプリケーション開発における設計パターンとアーキテクチャの選択について',
    category: 'アーキテクチャ',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
    href: '/articles/web-app-architecture',
    description: 'モダンなWebアプリケーション開発で重要な設計パターンとアーキテクチャの選択について、実際のプロジェクト経験を基に解説します。',
    categoryVariant: 'secondary',
  },
}

export const NoDescription: Story = {
  args: {
    title: '説明なしの記事カード',
    category: 'シンプル',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
    href: '/articles/simple-card',
    categoryVariant: 'destructive',
  },
}

export const CustomClassName: Story = {
  args: {
    title: 'カスタムスタイル適用例',
    category: 'デザイン',
    imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
    href: '/articles/custom-style',
    description: 'カスタムクラス名を適用した記事カードの例です。',
  },
}

export const HorizontalLayout: Story = {
  args: {
    title: '横並びレイアウトの記事カード',
    category: 'レイアウト',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
    href: '/articles/horizontal-layout',
    description: '画像とテキストが横並びで表示される記事カードのレイアウトです。コンパクトな表示に適しています。',
    layout: 'horizontal',
    aspectRatio: 1,
    categoryVariant: 'outline',
  },
}

// アスペクト比のバリエーション
export const AspectRatioVariations: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 max-w-6xl">
      <ArticleCard
        title="正方形カード (1:1)"
        category="デザイン"
        imageUrl="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80"
        href="/articles/square-design"
        description="正方形のアスペクト比で表示される記事カードです。"
        aspectRatio={1}
      />
      <ArticleCard
        title="ポートレート (3:4)"
        category="写真"
        imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80"
        href="/articles/portrait-photography"
        description="ポートレート比率で縦長に表示される記事カードです。"
        aspectRatio={3 / 4}
        categoryVariant="outline"
      />
      <ArticleCard
        title="ウルトラワイド (21:9)"
        category="映像"
        imageUrl="https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&h=300&q=80"
        href="/articles/ultra-wide-video"
        description="ウルトラワイド比率で横長に表示される記事カードです。"
        aspectRatio={21 / 9}
        categoryVariant="default"
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
}

// レイアウト比較
export const LayoutComparison: Story = {
  render: () => (
    <div className="space-y-8 p-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">縦レイアウト（Vertical）</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ArticleCard
            title="縦レイアウトの記事カード例"
            category="デザイン"
            imageUrl="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"
            href="/articles/vertical-example"
            description="縦方向のレイアウトで、画像が上部に配置される従来のカードスタイルです。"
            layout="vertical"
          />
          <ArticleCard
            title="もう一つの縦レイアウト例"
            category="開発"
            imageUrl="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"
            href="/articles/vertical-example-2"
            description="画像とコンテンツが縦に並ぶ、読みやすいレイアウトです。"
            layout="vertical"
            categoryVariant="outline"
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">横レイアウト（Horizontal）</h3>
        <div className="space-y-4">
          <ArticleCard
            title="横並びレイアウトの記事カード"
            category="UI/UX"
            imageUrl="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"
            href="/articles/horizontal-example"
            description="画像とテキストが横並びになる、コンパクトで効率的なレイアウトです。リスト表示に適しています。"
            layout="horizontal"
            aspectRatio={1}
          />
          <ArticleCard
            title="効率的な情報表示を実現する横レイアウト"
            category="エンジニアリング"
            imageUrl="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"
            href="/articles/horizontal-example-2"
            description="限られたスペースで多くの情報を表示できる横型レイアウトの活用方法について解説します。"
            layout="horizontal"
            aspectRatio={4/3}
            categoryVariant="default"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
}

// グリッドレイアウトでの表示例
export const GridLayout: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 max-w-6xl">
      <ArticleCard
        title="React Hooksの使い方"
        category="React"
        imageUrl="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"
        href="/articles/react-hooks"
        description="React Hooksの基本的な使い方を解説します。"
      />
      <ArticleCard
        title="Next.js 13 App Routerの新機能"
        category="Next.js"
        imageUrl="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"
        href="/articles/nextjs-app-router"
        description="Next.js 13のApp Routerで追加された新機能について。"
        categoryVariant="outline"
      />
      <ArticleCard
        title="Tailwind CSSのベストプラクティス"
        category="CSS"
        imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"
        href="/articles/tailwind-best-practices"
        description="Tailwind CSSを効率的に使うためのベストプラクティス。"
        categoryVariant="default"
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
} 