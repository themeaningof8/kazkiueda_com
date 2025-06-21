import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './ContextMenu'

describe('ContextMenu', () => {
  it('renders context menu trigger', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item 1</ContextMenuItem>
          <ContextMenuItem>Item 2</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )

    expect(screen.getByText('Right click me')).toBeInTheDocument()
  })

  it('opens context menu on right click', async () => {
    const user = userEvent.setup()
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item 1</ContextMenuItem>
          <ContextMenuItem>Item 2</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )

    const trigger = screen.getByText('Right click me')
    await user.pointer({ keys: '[MouseRight]', target: trigger })

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('applies custom className to trigger', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger className='custom-trigger'>Right click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item 1</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )

    const trigger = screen.getByText('Right click me')
    expect(trigger).toHaveClass('custom-trigger')
  })

  it('closes context menu when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <ContextMenu>
          <ContextMenuTrigger>Right click me</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Item 1</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <div>Outside element</div>
      </div>
    )

    const trigger = screen.getByText('Right click me')
    await user.pointer({ keys: '[MouseRight]', target: trigger })

    expect(screen.getByText('Item 1')).toBeInTheDocument()

    const outside = screen.getByText('Outside element')
    await user.click(outside)

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
  })

  it('supports destructive variant', async () => {
    const user = userEvent.setup()
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem variant='destructive'>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )

    const trigger = screen.getByText('Right click me')
    await user.pointer({ keys: '[MouseRight]', target: trigger })

    const deleteItem = screen.getByText('Delete')
    expect(deleteItem).toHaveAttribute('data-variant', 'destructive')
  })
})
