import { render, screen } from '@testing-library/react'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './Card'

describe('Card', () => {
  it('renders card with all components', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
          <CardAction>
            <button>Action</button>
          </CardAction>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(screen.getByText('Test Footer')).toBeInTheDocument()
  })

  it('applies custom className to card', () => {
    render(
      <Card className='custom-card-class'>
        <CardContent>Content</CardContent>
      </Card>
    )

    const card = screen.getByText('Content').closest('[data-slot="card"]')
    expect(card).toHaveClass('custom-card-class')
  })

  it('applies custom className to header', () => {
    render(
      <Card>
        <CardHeader className='custom-header-class'>
          <CardTitle>Title</CardTitle>
        </CardHeader>
      </Card>
    )

    const header = screen.getByText('Title').closest('[data-slot="card-header"]')
    expect(header).toHaveClass('custom-header-class')
  })

  it('renders minimal card structure', () => {
    render(
      <Card>
        <CardContent>Simple content</CardContent>
      </Card>
    )

    expect(screen.getByText('Simple content')).toBeInTheDocument()
  })

  it('renders header with action positioned correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardAction>
            <button>Action</button>
          </CardAction>
        </CardHeader>
      </Card>
    )

    const action = screen.getByText('Action').closest('[data-slot="card-action"]')
    expect(action).toHaveClass('col-start-2', 'row-span-2', 'row-start-1')
  })

  it('renders footer with correct styling', () => {
    render(
      <Card>
        <CardFooter className='border-t'>
          <button>Cancel</button>
          <button>Save</button>
        </CardFooter>
      </Card>
    )

    const footer = screen.getByText('Cancel').closest('[data-slot="card-footer"]')
    expect(footer).toHaveClass('border-t')
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })
})
