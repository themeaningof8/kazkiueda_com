import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio'

import * as React from 'react'

const AspectRatio = React.memo(
  ({ ...props }: React.ComponentProps<typeof AspectRatioPrimitive.Root>) => {
    return <AspectRatioPrimitive.Root data-slot='aspect-ratio' {...props} />
  }
)

AspectRatio.displayName = 'AspectRatio'

export { AspectRatio }
