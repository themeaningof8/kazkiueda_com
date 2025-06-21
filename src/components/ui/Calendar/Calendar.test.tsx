import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Calendar } from './Calendar'

describe('Calendar', () => {
  it('renders calendar component', () => {
    render(<Calendar />)
    const calendar = screen.getByRole('grid')
    expect(calendar).toBeInTheDocument()
  })

  it('displays current month', () => {
    render(<Calendar />)
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    const monthName = currentMonth.split(' ')[0] || '' // Get month name only
    // Check if the month appears somewhere in the document
    expect(screen.getByText(new RegExp(monthName, 'i'))).toBeInTheDocument()
  })

  it('allows navigation to previous month', async () => {
    const user = userEvent.setup()
    render(<Calendar />)

    const prevButton = screen.getByRole('button', { name: /previous month/i })
    expect(prevButton).toBeInTheDocument()

    await user.click(prevButton)
    // Calendar should still be present after navigation
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('allows navigation to next month', async () => {
    const user = userEvent.setup()
    render(<Calendar />)

    const nextButton = screen.getByRole('button', { name: /next month/i })
    expect(nextButton).toBeInTheDocument()

    await user.click(nextButton)
    // Calendar should still be present after navigation
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Calendar className='custom-calendar' />)
    const calendar = screen.getByRole('grid')
    expect(calendar.closest('[data-slot="calendar"]')).toHaveClass('custom-calendar')
  })
})
