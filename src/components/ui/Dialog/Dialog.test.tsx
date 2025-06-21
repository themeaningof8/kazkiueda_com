import { render, screen } from '@testing-library/react'
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
  it('renders dialog trigger', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
      </Dialog>
    )

    expect(screen.getByText('Open Dialog')).toBeInTheDocument()
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
    expect(screen.getByText('Footer content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('renders dialog content without close button when showCloseButton is false', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
  })

  it('has correct data-slot attributes', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByRole('dialog')).toHaveAttribute('data-slot', 'dialog-content')
    expect(screen.getByText('Title')).toHaveAttribute('data-slot', 'dialog-title')
    expect(screen.getByText('Description')).toHaveAttribute('data-slot', 'dialog-description')
  })

  it('renders with custom className', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent className='custom-dialog'>
          <DialogHeader className='custom-header'>
            <DialogTitle className='custom-title'>Title</DialogTitle>
            <DialogDescription className='custom-description'>Description</DialogDescription>
          </DialogHeader>
          <DialogFooter className='custom-footer'>
            <p>Footer</p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByRole('dialog')).toHaveClass('custom-dialog')
    expect(screen.getByText('Title')).toHaveClass('custom-title')
    expect(screen.getByText('Description')).toHaveClass('custom-description')
  })
})
