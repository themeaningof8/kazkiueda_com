import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './Button'

describe('Button', () => {
  it('renders button with text', () => {
    const { asFragment } = render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    expect(asFragment()).toMatchSnapshot()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    await userEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders as a link when using asChild', () => {
    const { asFragment } = render(
      <Button asChild>
        <a href='/test'>Link Button</a>
      </Button>
    )
    const link = screen.getByRole('link', { name: 'Link Button' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
    expect(asFragment()).toMatchSnapshot()
  })

  it('is disabled when disabled prop is true', () => {
    const { asFragment } = render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()
    expect(asFragment()).toMatchSnapshot()
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Button ref={ref}>Button</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  // Variant and Size Snapshot Tests
  const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const
  variants.forEach(variant => {
    it(`renders correctly with variant ${variant}`, () => {
      const { asFragment } = render(<Button variant={variant}>{variant}</Button>)
      expect(asFragment()).toMatchSnapshot()
    })
  })

  const sizes = ['default', 'sm', 'lg', 'icon'] as const
  sizes.forEach(size => {
    it(`renders correctly with size ${size}`, () => {
      const { asFragment } = render(<Button size={size} />)
      expect(asFragment()).toMatchSnapshot()
    })
  })
})
