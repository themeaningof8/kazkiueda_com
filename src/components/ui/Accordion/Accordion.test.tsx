import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './Accordion'

describe('Accordion', () => {
  it('renders accordion with items', () => {
    render(
      <Accordion type='single' collapsible>
        <AccordionItem value='item-1'>
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-2'>
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('expands and collapses accordion items', async () => {
    const user = userEvent.setup()

    render(
      <Accordion type='single' collapsible>
        <AccordionItem value='item-1'>
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger = screen.getByText('Item 1')

    // Initially content should not be visible
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()

    // Click to expand
    await user.click(trigger)
    expect(screen.getByText('Content 1')).toBeInTheDocument()

    // Click to collapse
    await user.click(trigger)
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
  })

  it('allows multiple items to be open when type is multiple', async () => {
    const user = userEvent.setup()

    render(
      <Accordion type='multiple'>
        <AccordionItem value='item-1'>
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-2'>
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    await user.click(screen.getByText('Item 1'))
    await user.click(screen.getByText('Item 2'))

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })
})
