import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('renders textarea field', () => {
    render(<Textarea placeholder='Test textarea' />)
    const textarea = screen.getByPlaceholderText('Test textarea')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveRole('textbox')
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()
    render(<Textarea placeholder='Type here' />)

    const textarea = screen.getByPlaceholderText('Type here')
    await user.type(textarea, 'Hello World\nMultiple lines')

    expect(textarea).toHaveValue('Hello World\nMultiple lines')
  })

  it('can be disabled', () => {
    render(<Textarea disabled placeholder='Disabled textarea' />)
    const textarea = screen.getByPlaceholderText('Disabled textarea')
    expect(textarea).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Textarea className='custom-class' placeholder='Custom textarea' />)
    const textarea = screen.getByPlaceholderText('Custom textarea')
    expect(textarea).toHaveClass('custom-class')
  })

  it('supports rows attribute', () => {
    render(<Textarea rows={10} placeholder='Many rows' />)
    const textarea = screen.getByPlaceholderText('Many rows')
    expect(textarea).toHaveAttribute('rows', '10')
  })

  it('handles controlled input', async () => {
    const handleChange = vi.fn()
    render(<Textarea value='controlled text' onChange={handleChange} />)

    const textarea = screen.getByDisplayValue('controlled text')
    expect(textarea).toHaveValue('controlled text')

    const user = userEvent.setup()
    await user.type(textarea, ' more')

    expect(handleChange).toHaveBeenCalled()
  })

  it('supports maxLength attribute', () => {
    render(<Textarea maxLength={100} placeholder='Limited textarea' />)
    const textarea = screen.getByPlaceholderText('Limited textarea')
    expect(textarea).toHaveAttribute('maxLength', '100')
  })

  it('supports required attribute', () => {
    render(<Textarea required placeholder='Required textarea' />)
    const textarea = screen.getByPlaceholderText('Required textarea')
    expect(textarea).toBeRequired()
  })

  it('supports readonly attribute', () => {
    render(<Textarea readOnly value='Read only text' />)
    const textarea = screen.getByDisplayValue('Read only text')
    expect(textarea).toHaveAttribute('readonly')
  })

  it('handles form association', () => {
    render(
      <form>
        <Textarea name='test-textarea' placeholder='Form textarea' />
      </form>
    )

    const textarea = screen.getByPlaceholderText('Form textarea')
    expect(textarea).toHaveAttribute('name', 'test-textarea')
  })

  it('supports resize classes', () => {
    const { rerender } = render(<Textarea className='resize-none' placeholder='No resize' />)
    let textarea = screen.getByPlaceholderText('No resize')
    expect(textarea).toHaveClass('resize-none')

    rerender(<Textarea className='resize' placeholder='Resizable' />)
    textarea = screen.getByPlaceholderText('Resizable')
    expect(textarea).toHaveClass('resize')
  })
})
