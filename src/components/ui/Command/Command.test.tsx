import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './Command'

// Mock scrollIntoView to avoid test errors
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

describe('Command', () => {
  it('applies custom className', () => {
    render(<Command className='custom-command' />)

    const command = document.querySelector('[data-slot="command"]')
    expect(command).toHaveClass('custom-command')
  })

  it('renders empty state when no results', () => {
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
        </CommandList>
      </Command>
    )

    expect(screen.getByText('No results found.')).toBeInTheDocument()
  })

  it('renders command input with placeholder', () => {
    render(
      <Command>
        <CommandInput placeholder='Type a command...' />
      </Command>
    )

    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument()
  })

  it('renders command groups and items', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup heading='Suggestions'>
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search Emoji</CommandItem>
            <CommandItem>Launch Email</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    )

    expect(screen.getByText('Suggestions')).toBeInTheDocument()
    expect(screen.getByText('Calendar')).toBeInTheDocument()
    expect(screen.getByText('Search Emoji')).toBeInTheDocument()
    expect(screen.getByText('Launch Email')).toBeInTheDocument()
  })

  it('renders command separator', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem>Item 1</CommandItem>
            <CommandSeparator data-testid='command-separator' />
            <CommandItem>Item 2</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    )

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByTestId('command-separator')).toBeInTheDocument()
  })

  it('renders command shortcut', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem>
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    )

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('⌘S')).toBeInTheDocument()
  })

  it('handles user input in command input', async () => {
    const user = userEvent.setup()
    render(
      <Command>
        <CommandInput placeholder='Search...' />
      </Command>
    )

    const input = screen.getByPlaceholderText('Search...')
    await user.type(input, 'test query')

    expect(input).toHaveValue('test query')
  })

  it('renders command dialog', () => {
    render(
      <CommandDialog open title='Command Palette' description='Search for commands'>
        <CommandInput placeholder='Type a command...' />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            <CommandItem>Test Item</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    )

    expect(screen.getByText('Command Palette')).toBeInTheDocument()
    expect(screen.getByText('Search for commands')).toBeInTheDocument()
    expect(screen.getByText('Test Item')).toBeInTheDocument()
  })

  it('applies custom className to command items', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem className='custom-item' data-testid='custom-item'>
              Custom Item
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    )

    const item = screen.getByTestId('custom-item')
    expect(item).toHaveClass('custom-item')
    expect(item).toHaveTextContent('Custom Item')
  })

  it('applies custom className to command groups', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup className='custom-group' data-testid='custom-group' heading='Custom Group'>
            <CommandItem>Item</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    )

    const group = screen.getByTestId('custom-group')
    expect(group).toHaveClass('custom-group')
  })
})
