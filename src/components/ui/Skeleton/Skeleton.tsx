import * as React from 'react'

import { cn } from '@/utils'

const Skeleton = React.memo(({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      data-slot='skeleton'
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  )
})

Skeleton.displayName = 'Skeleton'

export { Skeleton }
