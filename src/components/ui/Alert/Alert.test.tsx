import { render, screen } from '@testing-library/react'
import { AlertCircle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from './Alert'

describe('Alert', () => {
  it('renders alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Test Title</AlertTitle>
        <AlertDescription>Test Description</AlertDescription>
      </Alert>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('applies variant classes correctly', () => {
    render(
      <Alert variant='destructive'>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('text-destructive')
  })

  it('renders with icon', () => {
    render(
      <Alert>
        <AlertCircle data-testid='alert-icon' />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>This is a warning</AlertDescription>
      </Alert>
    )

    expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Alert className='custom-class'>
        <AlertTitle>Title</AlertTitle>
      </Alert>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('custom-class')
  })

  it('renders title only', () => {
    render(
      <Alert>
        <AlertTitle>Title Only</AlertTitle>
      </Alert>
    )

    expect(screen.getByText('Title Only')).toBeInTheDocument()
    expect(screen.queryByText('Description')).not.toBeInTheDocument()
  })

  it('renders description only', () => {
    render(
      <Alert>
        <AlertDescription>Description Only</AlertDescription>
      </Alert>
    )

    expect(screen.getByText('Description Only')).toBeInTheDocument()
    expect(screen.queryByText('Title')).not.toBeInTheDocument()
  })
})
