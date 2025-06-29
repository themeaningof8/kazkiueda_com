import React from 'react'

import { AspectRatio } from '@/components/ui/AspectRatio'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { cn } from '@/utils'

export interface ArticleCardProps {
  /** 記事のタイトル */
  title: string
  /** カテゴリ名 */
  category: string
  /** 画像のURL（外部URLまたはpublic内のパス） */
  imageUrl: string
  /** 記事のリンク先URL */
  href: string
  /** 記事の説明（オプション） */
  description?: string
  /** 画像のalt属性 */
  imageAlt?: string
  /** 外部リンクかどうか */
  isExternal?: boolean
  /** 追加のクラス名 */
  className?: string
  /** カテゴリのバリアント */
  categoryVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  /** 画像のアスペクト比 */
  aspectRatio?: number
  /** レイアウト */
  layout?: 'vertical' | 'horizontal'
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  category,
  imageUrl,
  href,
  description,
  imageAlt,
  isExternal = false,
  className,
  categoryVariant = 'secondary',
  aspectRatio = 21 / 9,
  layout = 'vertical',
}) => {
  const linkProps = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  const isHorizontal = layout === 'horizontal'

  return (
    <Card className={cn('group overflow-hidden transition-all pt-0 hover:shadow-lg', className)}>
      <a
        href={href}
        {...linkProps}
        className={cn('block space-y-4', isHorizontal && 'flex items-start gap-4')}
      >
        <CardHeader className='p-0'>
          <AspectRatio
            ratio={aspectRatio}
            className={cn('relative w-full overflow-hidden', isHorizontal && 'w-32 flex-shrink-0')}
          >
            <img
              src={imageUrl}
              alt={imageAlt || title}
              className='h-full w-full object-cover transition-transform group-hover:scale-105'
              loading='lazy'
            />
            <div className='absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10' />
          </AspectRatio>
        </CardHeader>
        <CardContent className={cn('space-y-2', isHorizontal && 'flex-grow')}>
          <h3 className='mb-2 font-semibold leading-tight group-hover:text-primary transition-colors'>
            {title}
          </h3>
          {description && (
            <p className='text-sm text-muted-foreground line-clamp-2'>{description}</p>
          )}
          <div className='flex items-center justify-end'>
            <Badge variant={categoryVariant} className='text-xs'>
              {category}
            </Badge>
          </div>
        </CardContent>
      </a>
    </Card>
  )
}
