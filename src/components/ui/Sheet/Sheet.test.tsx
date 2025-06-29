import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button } from '../Button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './Sheet'

describe('Sheet', () => {
  it('renders sheet trigger', () => {
    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Test Title</SheetTitle>
            <SheetDescription>Test Description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )

    expect(screen.getByText('Open Sheet')).toBeInTheDocument()
  })

  it('opens sheet when trigger is clicked', async () => {
    const user = userEvent.setup()

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Test Title</SheetTitle>
            <SheetDescription>Test Description</SheetDescription>
          </SheetHeader>
          <p>Sheet content</p>
        </SheetContent>
      </Sheet>
    )

    const trigger = screen.getByText('Open Sheet')
    await user.click(trigger)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Sheet content')).toBeInTheDocument()
  })

  it('can be controlled', () => {
    render(
      <Sheet open>
        <SheetTrigger asChild>
          <Button>Trigger</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Controlled Sheet</SheetTitle>
            <SheetDescription>Test Description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )

    expect(screen.getByText('Controlled Sheet')).toBeInTheDocument()
  })
})
