import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog'

describe('Dialog', () => {
  it('renders dialog with content and title', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>
    )

    const trigger = screen.getByText('Open')
    await user.click(trigger)

    expect(await screen.findByText('Dialog Title')).toBeInTheDocument()
    expect(await screen.findByText('Dialog Content')).toBeInTheDocument()
    expect(await screen.findByText('Dialog Description')).toBeInTheDocument()
  })

  it('renders dialog content without close button when showCloseButton is false', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>No Close Button</DialogTitle>
            <DialogDescription>This is a dialog without a close button.</DialogDescription>
          </DialogHeader>
          <div>Content</div>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByText('No Close Button')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
  })

  it('renders with custom className', () => {
    render(
      <Dialog open>
        <DialogContent className='custom-dialog-class'>
          <DialogHeader>
            <DialogTitle>Custom Class</DialogTitle>
            <DialogDescription>This dialog has a custom class.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    const dialogContent = screen.getByRole('dialog')
    expect(dialogContent).toHaveClass('custom-dialog-class')
  })

  it('can be controlled via open prop', () => {
    const { rerender } = render(
      <Dialog open={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled Dialog</DialogTitle>
            <DialogDescription>This is a controlled dialog.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    rerender(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled Dialog</DialogTitle>
            <DialogDescription>This is a controlled dialog.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes when close button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog to Close</DialogTitle>
            <DialogDescription>This dialog will be closed.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog content when open', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <p>Footer content</p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    expect(screen.getByText('Dialog Description')).toBeInTheDocument()
  })
})
