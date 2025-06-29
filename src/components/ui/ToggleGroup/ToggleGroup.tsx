'use client'

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { type VariantProps } from 'class-variance-authority'

import * as React from 'react'

import { toggleVariants } from '@/components/ui/Toggle'
import { cn } from '@/utils'

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: 'default',
  variant: 'default',
})

const ToggleGroup = React.memo(
  ({
    className,
    variant,
    size,
    children,
    ...props
  }: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>) => {
    const contextValue = React.useMemo(() => ({ variant, size }), [variant, size])

    return (
      <ToggleGroupPrimitive.Root
        data-slot='toggle-group'
        data-variant={variant}
        data-size={size}
        className={cn(
          'group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs',
          className
        )}
        {...props}
      >
        <ToggleGroupContext value={contextValue}>{children}</ToggleGroupContext>
      </ToggleGroupPrimitive.Root>
    )
  }
)

ToggleGroup.displayName = 'ToggleGroup'

const ToggleGroupItem = React.memo(
  ({
    className,
    children,
    variant,
    size,
    ...props
  }: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>) => {
    const context = React.useContext(ToggleGroupContext)

    return (
      <ToggleGroupPrimitive.Item
        data-slot='toggle-group-item'
        data-variant={context.variant || variant}
        data-size={context.size || size}
        className={cn(
          toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
          }),
          'min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
          className
        )}
        {...props}
      >
        {children}
      </ToggleGroupPrimitive.Item>
    )
  }
)

ToggleGroupItem.displayName = 'ToggleGroupItem'

export { ToggleGroup, ToggleGroupItem }
