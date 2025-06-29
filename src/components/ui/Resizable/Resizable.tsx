import { GripVerticalIcon } from 'lucide-react'

import * as React from 'react'
import * as ResizablePrimitive from 'react-resizable-panels'

import { cn } from '@/utils'

const ResizablePanelGroup = React.memo(
  ({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => {
    return (
      <ResizablePrimitive.PanelGroup
        data-slot='resizable-panel-group'
        className={cn(
          'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
          className
        )}
        {...props}
      />
    )
  }
)

ResizablePanelGroup.displayName = 'ResizablePanelGroup'

const ResizablePanel = React.memo(
  ({ ...props }: React.ComponentProps<typeof ResizablePrimitive.Panel>) => {
    return <ResizablePrimitive.Panel data-slot='resizable-panel' {...props} />
  }
)

ResizablePanel.displayName = 'ResizablePanel'

const ResizableHandle = React.memo(
  ({
    withHandle,
    className,
    ...props
  }: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
    withHandle?: boolean
  }) => {
    return (
      <ResizablePrimitive.PanelResizeHandle
        data-slot='resizable-handle'
        className={cn(
          'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90',
          className
        )}
        {...props}
      >
        {withHandle && (
          <div className='z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border'>
            <GripVerticalIcon className='h-2.5 w-2.5' />
          </div>
        )}
      </ResizablePrimitive.PanelResizeHandle>
    )
  }
)

ResizableHandle.displayName = 'ResizableHandle'

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
