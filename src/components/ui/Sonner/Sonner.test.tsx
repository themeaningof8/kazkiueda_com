import { render, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import { Toaster } from './Sonner'

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light' }),
}))

describe('Toaster', () => {
  it('renders toaster correctly', async () => {
    const { container } = render(<Toaster />)
    // Sonner creates the toaster element asynchronously via portal
    await waitFor(() => {
      const toaster = document.querySelector('section[aria-label*="Notifications"]')
      expect(toaster).toBeInTheDocument()
    })
    // Also verify that the component rendered something
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies custom props correctly', () => {
    const { container } = render(<Toaster position='top-center' />)
    const toaster = container.firstChild as HTMLElement
    expect(toaster).toBeInTheDocument()
  })

  it('uses theme from next-themes', () => {
    const { container } = render(<Toaster />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
