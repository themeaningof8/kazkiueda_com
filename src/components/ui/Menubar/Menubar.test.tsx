import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from './Menubar'

describe('Menubar', () => {
  it('renders menubar with triggers', () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New File</MenubarItem>
            <MenubarItem>Open</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Copy</MenubarItem>
            <MenubarItem>Paste</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )

    expect(screen.getByText('File')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('opens menu content when trigger is clicked', async () => {
    const user = userEvent.setup()

    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New File</MenubarItem>
            <MenubarItem>Open</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )

    const trigger = screen.getByText('File')
    await user.click(trigger)

    expect(screen.getByText('New File')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('renders menu items with separators', async () => {
    const user = userEvent.setup()

    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New File</MenubarItem>
            <MenubarSeparator data-testid='separator' />
            <MenubarItem>Exit</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )

    const trigger = screen.getByText('File')
    await user.click(trigger)

    expect(screen.getByText('New File')).toBeInTheDocument()
    expect(screen.getByTestId('separator')).toBeInTheDocument()
    expect(screen.getByText('Exit')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Menubar className='custom-menubar' data-testid='menubar'>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New File</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )

    const menubar = screen.getByTestId('menubar')
    expect(menubar).toHaveClass('custom-menubar')
  })

  it('has correct data-slot attributes', () => {
    render(
      <Menubar data-testid='menubar'>
        <MenubarMenu>
          <MenubarTrigger data-testid='trigger'>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem data-testid='item'>New File</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )

    expect(screen.getByTestId('menubar')).toHaveAttribute('data-slot', 'menubar')
    expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'menubar-trigger')
  })
})
