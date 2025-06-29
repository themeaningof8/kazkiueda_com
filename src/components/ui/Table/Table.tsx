import * as React from 'react'

import { cn } from '@/utils'

const Table = React.memo(({ className, ...props }: React.ComponentProps<'table'>) => {
  return (
    <div data-slot='table-container' className='relative w-full overflow-x-auto'>
      <table
        data-slot='table'
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
})

Table.displayName = 'Table'

const TableHeader = React.memo(({ className, ...props }: React.ComponentProps<'thead'>) => {
  return <thead data-slot='table-header' className={cn('[&_tr]:border-b', className)} {...props} />
})

TableHeader.displayName = 'TableHeader'

const TableBody = React.memo(({ className, ...props }: React.ComponentProps<'tbody'>) => {
  return (
    <tbody
      data-slot='table-body'
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
})

TableBody.displayName = 'TableBody'

const TableFooter = React.memo(({ className, ...props }: React.ComponentProps<'tfoot'>) => {
  return (
    <tfoot
      data-slot='table-footer'
      className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
})

TableFooter.displayName = 'TableFooter'

const TableRow = React.memo(({ className, ...props }: React.ComponentProps<'tr'>) => {
  return (
    <tr
      data-slot='table-row'
      className={cn(
        'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
        className
      )}
      {...props}
    />
  )
})

TableRow.displayName = 'TableRow'

const TableHead = React.memo(({ className, ...props }: React.ComponentProps<'th'>) => {
  return (
    <th
      data-slot='table-head'
      className={cn(
        'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  )
})

TableHead.displayName = 'TableHead'

const TableCell = React.memo(({ className, ...props }: React.ComponentProps<'td'>) => {
  return (
    <td
      data-slot='table-cell'
      className={cn(
        'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  )
})

TableCell.displayName = 'TableCell'

const TableCaption = React.memo(({ className, ...props }: React.ComponentProps<'caption'>) => {
  return (
    <caption
      data-slot='table-caption'
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  )
})

TableCaption.displayName = 'TableCaption'

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
