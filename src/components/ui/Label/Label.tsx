'use client'

import * as LabelPrimitive from '@radix-ui/react-label'
import { type VariantProps, cva } from 'class-variance-authority'

import * as React from 'react'

import { cn } from '@/utils'

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
)

type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants> & {
    ref?: React.Ref<React.ComponentRef<typeof LabelPrimitive.Root>>
  }

const Label = React.memo<LabelProps>(({ className, ref, ...props }) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
))

Label.displayName = LabelPrimitive.Root.displayName

export { Label, type LabelProps }
