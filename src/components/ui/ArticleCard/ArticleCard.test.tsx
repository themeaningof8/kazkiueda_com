import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ArticleCard } from './ArticleCard'

const defaultProps = {
  title: 'テスト記事タイトル',
  category: 'テクノロジー',
  imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80',
  href: '/test-article',
}

describe('ArticleCard', () => {
  it('必須プロパティが正しく表示される', () => {
    render(<ArticleCard {...defaultProps} />)
    
    expect(screen.getByText('テスト記事タイトル')).toBeInTheDocument()
    expect(screen.getByText('テクノロジー')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', defaultProps.imageUrl)
    expect(screen.getByRole('link')).toHaveAttribute('href', defaultProps.href)
  })

  it('説明が提供された時に表示される', () => {
    const description = 'これはテスト記事の説明です。'
    render(<ArticleCard {...defaultProps} description={description} />)
    
    expect(screen.getByText(description)).toBeInTheDocument()
  })

  it('外部リンクの場合に適切な属性が設定される', () => {
    render(<ArticleCard {...defaultProps} isExternal={true} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
  it('画像のalt属性が設定される', () => {
    const altText = 'カスタムalt属性'
    render(<ArticleCard {...defaultProps} imageAlt={altText} />)
    
    expect(screen.getByRole('img')).toHaveAttribute('alt', altText)
  })

  it('alt属性が提供されない場合、タイトルがalt属性に使用される', () => {
    render(<ArticleCard {...defaultProps} />)
    
    expect(screen.getByRole('img')).toHaveAttribute('alt', defaultProps.title)
  })

  it('異なるカテゴリバリアントが適用される', () => {
    render(<ArticleCard {...defaultProps} categoryVariant="outline" />)
    
    const badge = screen.getByText('テクノロジー')
    expect(badge).toBeInTheDocument()
  })

  it('publicディレクトリの画像URLで動作する', () => {
    const publicImageUrl = '/images/test-image.jpg'
    render(<ArticleCard {...defaultProps} imageUrl={publicImageUrl} />)
    
    expect(screen.getByRole('img')).toHaveAttribute('src', publicImageUrl)
  })

  it('縦レイアウト（デフォルト）で正しく表示される', () => {
    render(<ArticleCard {...defaultProps} layout="vertical" />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveClass('flex-col')
  })

  it('横レイアウトで正しく表示される', () => {
    render(<ArticleCard {...defaultProps} layout="horizontal" />)
    
    const link = screen.getByRole('link')
    expect(link).not.toHaveClass('flex-col')
    expect(link).toHaveClass('flex')
  })

  it('カスタムアスペクト比が適用される', () => {
    render(<ArticleCard {...defaultProps} aspectRatio={1} />)
    
    // AspectRatioコンポーネントが正しく表示されることを確認
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('異なるUnsplash画像で動作する', () => {
    const unsplashImageUrl = 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80'
    render(<ArticleCard {...defaultProps} imageUrl={unsplashImageUrl} />)
    
    expect(screen.getByRole('img')).toHaveAttribute('src', unsplashImageUrl)
  })

}) 