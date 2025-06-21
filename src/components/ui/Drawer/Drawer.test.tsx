import { render, screen } from '@testing-library/react'

import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from './Drawer'

describe('Drawer', () => {
  it('renders drawer trigger', () => {
    render(
      <Drawer>
        <DrawerTrigger>Open Drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Drawer Title</DrawerTitle>
        </DrawerContent>
      </Drawer>
    )

    expect(screen.getByText('Open Drawer')).toBeInTheDocument()
  })

  it('applies custom className to trigger', () => {
    render(
      <Drawer>
        <DrawerTrigger className='custom-trigger'>Open Drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Drawer Title</DrawerTitle>
        </DrawerContent>
      </Drawer>
    )

    const trigger = screen.getByText('Open Drawer')
    expect(trigger).toHaveClass('custom-trigger')
  })

  it('renders drawer content when open', () => {
    render(
      <Drawer open>
        <DrawerTrigger>Open Drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <p>Drawer content</p>
        </DrawerContent>
      </Drawer>
    )

    expect(screen.getByText('Drawer Title')).toBeInTheDocument()
    expect(screen.getByText('Drawer content')).toBeInTheDocument()
  })
})
