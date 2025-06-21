import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Input } from './Input'

describe('Input', () => {
  it('renders input field', () => {
    render(<Input placeholder='Test input' />)
    const input = screen.getByPlaceholderText('Test input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveRole('textbox')
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()
    render(<Input placeholder='Type here' />)

    const input = screen.getByPlaceholderText('Type here')
    await user.type(input, 'Hello World')

    expect(input).toHaveValue('Hello World')
  })

  it('can be disabled', () => {
    render(<Input disabled placeholder='Disabled input' />)
    const input = screen.getByPlaceholderText('Disabled input')
    expect(input).toBeDisabled()
  })

  it('supports different input types', () => {
    render(<Input type='email' placeholder='Email input' />)
    const input = screen.getByPlaceholderText('Email input')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('applies custom className', () => {
    render(<Input className='custom-class' placeholder='Custom input' />)
    const input = screen.getByPlaceholderText('Custom input')
    expect(input).toHaveClass('custom-class')
  })

  it('handles controlled input', async () => {
    const handleChange = vi.fn()
    render(<Input value='controlled' onChange={handleChange} />)

    const input = screen.getByDisplayValue('controlled')
    expect(input).toHaveValue('controlled')

    const user = userEvent.setup()
    await user.type(input, 'x')

    expect(handleChange).toHaveBeenCalled()
  })

  it('supports file input type', () => {
    render(<Input type='file' data-testid='file-input' />)
    const input = screen.getByTestId('file-input')
    expect(input).toHaveAttribute('type', 'file')
  })

  it('handles required attribute', () => {
    render(<Input required placeholder='Required input' />)
    const input = screen.getByPlaceholderText('Required input')
    expect(input).toBeRequired()
  })
})
