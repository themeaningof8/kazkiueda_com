import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { useForm } from 'react-hook-form'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from './Form'

const TestForm = ({ onSubmit = vi.fn() }) => {
  const form = useForm({
    mode: 'onChange', // リアルタイムバリデーションを有効化
    defaultValues: {
      username: '',
      email: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} data-testid='test-form'>
        <FormField
          control={form.control}
          name='username'
          rules={{ required: 'Username is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <input {...field} placeholder='Enter username' />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input {...field} placeholder='Enter email' type='email' />
              </FormControl>
              <FormDescription>We'll never share your email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <button type='submit'>Submit</button>
      </form>
    </Form>
  )
}

describe('Form', () => {
  it('renders form with fields', () => {
    render(<TestForm />)

    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  it('shows form descriptions', () => {
    render(<TestForm />)

    expect(screen.getByText('This is your public display name.')).toBeInTheDocument()
    expect(screen.getByText("We'll never share your email.")).toBeInTheDocument()
  })

  it('shows validation errors when fields are invalid', async () => {
    const user = userEvent.setup()
    render(<TestForm />)

    const submitButton = screen.getByRole('button', { name: 'Submit' })
    await user.click(submitButton)

    expect(screen.getByText('Username is required')).toBeInTheDocument()
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<TestForm />)

    const emailInput = screen.getByLabelText('Email')
    await user.type(emailInput, 'invalid-email')
    await user.tab() // フィールドからフォーカスを外す

    const submitButton = screen.getByRole('button', { name: 'Submit' })
    await user.click(submitButton)

    // React Hook Formの非同期バリデーションを待つ
    await waitFor(
      () => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('calls onSubmit when form is valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TestForm onSubmit={onSubmit} />)

    const usernameInput = screen.getByLabelText('Username')
    const emailInput = screen.getByLabelText('Email')

    await user.type(usernameInput, 'testuser')
    await user.type(emailInput, 'test@example.com')

    const submitButton = screen.getByRole('button', { name: 'Submit' })
    await user.click(submitButton)

    expect(onSubmit).toHaveBeenCalledWith(
      {
        username: 'testuser',
        email: 'test@example.com',
      },
      expect.any(Object) // イベントオブジェクトも渡される
    )
  })

  it('clears errors when fields become valid', async () => {
    const user = userEvent.setup()
    render(<TestForm />)

    // First trigger validation errors
    const submitButton = screen.getByRole('button', { name: 'Submit' })
    await user.click(submitButton)

    expect(screen.getByText('Username is required')).toBeInTheDocument()

    // Then fix the validation by typing
    const usernameInput = screen.getByLabelText('Username')
    await user.type(usernameInput, 'testuser')

    // Error should disappear
    expect(screen.queryByText('Username is required')).not.toBeInTheDocument()
  })
})

describe('FormField', () => {
  it('provides field context to children', () => {
    const TestComponent = () => {
      const form = useForm({ defaultValues: { test: '' } })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name='test'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <input {...field} data-testid='test-input' />
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<TestComponent />)
    expect(screen.getByTestId('test-input')).toBeInTheDocument()
  })
})

describe('FormItem', () => {
  it('generates unique id for form items', () => {
    const TestComponent = () => {
      const form = useForm({ defaultValues: { test: '' } })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name='test'
            render={() => (
              <FormItem data-testid='form-item'>
                <FormLabel>Test Label</FormLabel>
                <FormControl>
                  <input />
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<TestComponent />)

    const formItem = screen.getByTestId('form-item')
    expect(formItem).toHaveAttribute('data-slot', 'form-item')
  })
})

describe('FormLabel', () => {
  it('associates label with form control', () => {
    const TestComponent = () => {
      const form = useForm({ defaultValues: { test: '' } })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name='test'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Label</FormLabel>
                <FormControl>
                  <input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<TestComponent />)

    const label = screen.getByText('Test Label')
    const input = screen.getByLabelText('Test Label')

    expect(label).toHaveAttribute('for')
    expect(input).toHaveAttribute('id', label.getAttribute('for'))
  })

  it('shows error state when field has error', async () => {
    const user = userEvent.setup()
    const TestComponent = () => {
      const form = useForm({ defaultValues: { test: '' } })
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(() => {})}>
            <FormField
              control={form.control}
              name='test'
              rules={{ required: 'Required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid='form-label'>Test Label</FormLabel>
                  <FormControl>
                    <input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button type='submit'>Submit</button>
          </form>
        </Form>
      )
    }

    render(<TestComponent />)

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    const label = screen.getByTestId('form-label')
    expect(label).toHaveAttribute('data-error', 'true')
  })
})

describe('FormControl', () => {
  it('applies proper accessibility attributes', () => {
    const TestComponent = () => {
      const form = useForm({ defaultValues: { test: '' } })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name='test'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Label</FormLabel>
                <FormControl>
                  <input {...field} data-testid='form-control' />
                </FormControl>
                <FormDescription>Test description</FormDescription>
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<TestComponent />)

    const input = screen.getByTestId('form-control')
    expect(input).toHaveAttribute('aria-describedby')
    expect(input).toHaveAttribute('aria-invalid', 'false')
  })

  it('updates aria-invalid when field has error', async () => {
    const user = userEvent.setup()
    const TestComponent = () => {
      const form = useForm({ defaultValues: { test: '' } })
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(() => {})}>
            <FormField
              control={form.control}
              name='test'
              rules={{ required: 'Required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Label</FormLabel>
                  <FormControl>
                    <input {...field} data-testid='form-control' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button type='submit'>Submit</button>
          </form>
        </Form>
      )
    }

    render(<TestComponent />)

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    const input = screen.getByTestId('form-control')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('FormDescription', () => {
  it('renders description text', () => {
    const TestComponent = () => {
      const form = useForm({ defaultValues: { test: '' } })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name='test'
            render={() => (
              <FormItem>
                <FormDescription>This is a test description</FormDescription>
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<TestComponent />)

    expect(screen.getByText('This is a test description')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    const TestComponent = () => {
      const form = useForm({ defaultValues: { test: '' } })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name='test'
            render={() => (
              <FormItem>
                <FormDescription data-testid='form-description'>Test description</FormDescription>
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<TestComponent />)

    const description = screen.getByTestId('form-description')
    expect(description).toHaveAttribute('id')
    expect(description).toHaveAttribute('data-slot', 'form-description')
  })
})

describe('FormMessage', () => {
  it('displays error message when field has error', async () => {
    const user = userEvent.setup()
    const TestComponent = () => {
      const form = useForm({ defaultValues: { test: '' } })
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(() => {})}>
            <FormField
              control={form.control}
              name='test'
              rules={{ required: 'This field is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button type='submit'>Submit</button>
          </form>
        </Form>
      )
    }

    render(<TestComponent />)

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('displays custom children when no error', () => {
    const TestComponent = () => {
      const form = useForm({ defaultValues: { test: '' } })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name='test'
            render={() => (
              <FormItem>
                <FormMessage>Custom message</FormMessage>
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<TestComponent />)

    expect(screen.getByText('Custom message')).toBeInTheDocument()
  })

  it('returns null when no error and no children', () => {
    const TestComponent = () => {
      const form = useForm({ defaultValues: { test: '' } })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name='test'
            render={() => (
              <FormItem>
                <FormMessage data-testid='form-message' />
              </FormItem>
            )}
          />
        </Form>
      )
    }

    const { container } = render(<TestComponent />)

    expect(container.querySelector('[data-testid="form-message"]')).not.toBeInTheDocument()
  })
})

describe('useFormField hook', () => {
  it('throws error when used outside FormField', () => {
    const TestComponent = () => {
      useFormField() // This should throw
      return <div>Test</div>
    }

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<TestComponent />)).toThrow(
      // React Hook Formの実際のエラーメッセージを期待
      "Cannot destructure property 'getFieldState' of '(0 , __vite_ssr_import_4__.useFormContext)(...)' as it is null."
    )

    consoleSpy.mockRestore()
  })

  it('provides form field context', () => {
    let fieldContext: any

    const TestComponent = () => {
      const form = useForm({ defaultValues: { test: '' } })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name='test'
            render={() => {
              fieldContext = useFormField()
              return (
                <FormItem>
                  <div data-testid='test-component'>Test</div>
                </FormItem>
              )
            }}
          />
        </Form>
      )
    }

    render(<TestComponent />)

    expect(fieldContext).toBeDefined()
    expect(fieldContext.name).toBe('test')
    expect(fieldContext.formItemId).toMatch(/form-item$/)
    expect(fieldContext.formDescriptionId).toMatch(/form-item-description$/)
    expect(fieldContext.formMessageId).toMatch(/form-item-message$/)
  })
})
