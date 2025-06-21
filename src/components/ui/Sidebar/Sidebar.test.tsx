import { render, screen } from '@testing-library/react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from './Sidebar'

describe('Sidebar', () => {
  it('renders sidebar with content', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Dashboard</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Profile</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <SidebarProvider>
        <Sidebar className='custom-sidebar' data-testid='sidebar'>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Dashboard</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    )

    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toHaveClass('custom-sidebar')
  })

  it('has correct data-slot attributes', () => {
    render(
      <SidebarProvider>
        <Sidebar data-testid='sidebar'>
          <SidebarContent data-testid='content'>
            <SidebarGroup data-testid='group'>
              <SidebarGroupContent data-testid='group-content'>
                <SidebarMenu data-testid='menu'>
                  <SidebarMenuItem data-testid='menu-item'>
                    <SidebarMenuButton data-testid='menu-button'>Dashboard</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-slot', 'sidebar-container')
    expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'sidebar-content')
    expect(screen.getByTestId('group')).toHaveAttribute('data-slot', 'sidebar-group')
    expect(screen.getByTestId('group-content')).toHaveAttribute(
      'data-slot',
      'sidebar-group-content'
    )
    expect(screen.getByTestId('menu')).toHaveAttribute('data-slot', 'sidebar-menu')
    expect(screen.getByTestId('menu-item')).toHaveAttribute('data-slot', 'sidebar-menu-item')
    expect(screen.getByTestId('menu-button')).toHaveAttribute('data-slot', 'sidebar-menu-button')
  })
})
