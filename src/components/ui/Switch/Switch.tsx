'use client'

import * as SwitchPrimitive from '@radix-ui/react-switch'

import * as React from 'react'

import { cn } from '@/lib/utils'

const Switch = React.memo(
  ({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) => {
    return (
      <SwitchPrimitive.Root
        data-slot='switch'
        className={cn(
          'peer border-input data-[state=checked]:bg-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 bg-transparent shadow-xs transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          data-slot='switch-thumb'
          className={cn(
            'bg-background data-[state=checked]:bg-background pointer-events-none block size-5 rounded-full shadow-xs ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
          )}
        />
      </SwitchPrimitive.Root>
    )
  }
)

Switch.displayName = 'Switch'

export { Switch }
