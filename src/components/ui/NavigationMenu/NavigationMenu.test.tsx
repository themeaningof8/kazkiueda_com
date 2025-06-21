import { render, screen } from '@testing-library/react'

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from './NavigationMenu'

describe('NavigationMenu', () => {
  it('renders navigation menu with links', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href='/'>Home</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href='/about'>About</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <NavigationMenu className='custom-nav' data-testid='nav'>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href='/'>Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    )

    const nav = screen.getByTestId('nav')
    expect(nav).toHaveClass('custom-nav')
  })

  it('has correct data-slot attributes', () => {
    render(
      <NavigationMenu data-testid='nav'>
        <NavigationMenuList data-testid='list'>
          <NavigationMenuItem data-testid='item'>
            <NavigationMenuLink href='/' data-testid='link'>
              Home
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    )

    expect(screen.getByTestId('nav')).toHaveAttribute('data-slot', 'navigation-menu')
    expect(screen.getByTestId('list')).toHaveAttribute('data-slot', 'navigation-menu-list')
    expect(screen.getByTestId('item')).toHaveAttribute('data-slot', 'navigation-menu-item')
    expect(screen.getByTestId('link')).toHaveAttribute('data-slot', 'navigation-menu-link')
  })
})
