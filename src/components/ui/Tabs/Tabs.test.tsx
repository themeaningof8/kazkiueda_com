import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs'

describe('Tabs', () => {
  it('renders tabs with trigger and content', () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
          <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>Content for Tab 1</TabsContent>
        <TabsContent value='tab2'>Content for Tab 2</TabsContent>
      </Tabs>
    )

    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
    expect(screen.getByText('Content for Tab 1')).toBeInTheDocument()
    expect(screen.queryByText('Content for Tab 2')).not.toBeInTheDocument()
  })

  it('switches between tabs when triggered', async () => {
    const user = userEvent.setup()

    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
          <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>Content for Tab 1</TabsContent>
        <TabsContent value='tab2'>Content for Tab 2</TabsContent>
      </Tabs>
    )

    expect(screen.getByText('Content for Tab 1')).toBeInTheDocument()

    await user.click(screen.getByText('Tab 2'))

    expect(screen.getByText('Content for Tab 2')).toBeInTheDocument()
    expect(screen.queryByText('Content for Tab 1')).not.toBeInTheDocument()
  })

  it('has correct data-slot attributes', () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>Content 1</TabsContent>
      </Tabs>
    )

    expect(screen.getByText('Tab 1')).toHaveAttribute('data-slot', 'tabs-trigger')
    expect(screen.getByText('Content 1')).toHaveAttribute('data-slot', 'tabs-content')
  })

  it('renders with custom className', () => {
    render(
      <Tabs defaultValue='tab1' className='custom-tabs'>
        <TabsList className='custom-list'>
          <TabsTrigger value='tab1' className='custom-trigger'>
            Tab 1
          </TabsTrigger>
        </TabsList>
        <TabsContent value='tab1' className='custom-content'>
          Content 1
        </TabsContent>
      </Tabs>
    )

    const tabsRoot = screen.getByText('Tab 1').closest('[data-slot="tabs"]')
    expect(tabsRoot).toHaveClass('custom-tabs')
    expect(screen.getByRole('tablist')).toHaveClass('custom-list')
    expect(screen.getByText('Tab 1')).toHaveClass('custom-trigger')
    expect(screen.getByText('Content 1')).toHaveClass('custom-content')
  })
})
