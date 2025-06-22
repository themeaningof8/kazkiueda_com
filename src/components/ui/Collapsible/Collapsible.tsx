import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'

import * as React from 'react'

const Collapsible = React.memo(
  ({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) => {
    return <CollapsiblePrimitive.Root data-slot='collapsible' {...props} />
  }
)

Collapsible.displayName = 'Collapsible'

const CollapsibleTrigger = React.memo(
  ({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) => {
    return <CollapsiblePrimitive.CollapsibleTrigger data-slot='collapsible-trigger' {...props} />
  }
)

CollapsibleTrigger.displayName = 'CollapsibleTrigger'

const CollapsibleContent = React.memo(
  ({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) => {
    return <CollapsiblePrimitive.CollapsibleContent data-slot='collapsible-content' {...props} />
  }
)

CollapsibleContent.displayName = 'CollapsibleContent'

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
