import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'

import * as React from 'react'

import { type ButtonProps, buttonVariants } from '@/components/ui/Button'
import { cn } from '@/utils'

const Pagination = React.memo(({ className, ...props }: React.ComponentProps<'nav'>) => {
  return (
    <nav
      data-slot='pagination'
      role='navigation'
      aria-label='pagination'
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
})

Pagination.displayName = 'Pagination'

const PaginationContent = React.memo(({ className, ...props }: React.ComponentProps<'ul'>) => {
  return (
    <ul
      data-slot='pagination-content'
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  )
})

PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.memo(({ ...props }: React.ComponentProps<'li'>) => {
  return <li data-slot='pagination-item' {...props} />
})

PaginationItem.displayName = 'PaginationItem'

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>

const PaginationLink = React.memo(
  ({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) => {
    return (
      <a
        data-slot='pagination-link'
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          buttonVariants({
            variant: isActive ? 'outline' : 'ghost',
            size,
          }),
          className
        )}
        {...props}
      />
    )
  }
)

PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = React.memo(
  ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => {
    return (
      <PaginationLink
        data-slot='pagination-previous'
        aria-label='Go to previous page'
        size='default'
        className={cn('gap-1 pl-2.5', className)}
        {...props}
      >
        <ChevronLeftIcon className='h-4 w-4' />
        <span>Previous</span>
      </PaginationLink>
    )
  }
)

PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = React.memo(
  ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => {
    return (
      <PaginationLink
        data-slot='pagination-next'
        aria-label='Go to next page'
        size='default'
        className={cn('gap-1 pr-2.5', className)}
        {...props}
      >
        <span>Next</span>
        <ChevronRightIcon className='h-4 w-4' />
      </PaginationLink>
    )
  }
)

PaginationNext.displayName = 'PaginationNext'

const PaginationEllipsis = React.memo(({ className, ...props }: React.ComponentProps<'span'>) => {
  return (
    <span
      data-slot='pagination-ellipsis'
      aria-hidden
      className={cn('flex h-9 w-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontalIcon className='h-4 w-4' />
      <span className='sr-only'>More pages</span>
    </span>
  )
})

PaginationEllipsis.displayName = 'PaginationEllipsis'

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
