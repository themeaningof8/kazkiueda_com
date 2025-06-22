import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChevronDown } from 'lucide-react'

import { useState } from 'react'

import { Button } from '../Button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './Collapsible'

const meta = {
  title: 'Components/UI/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Collapsible className='w-80'>
      <CollapsibleTrigger asChild>
        <Button variant='outline' className='w-full justify-between'>
          Can I use this in my project?
          <ChevronDown className='h-4 w-4' />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className='p-4 border border-t-0 rounded-b-md'>
        <p className='text-sm text-muted-foreground'>
          Yes. Free to use for personal and commercial projects. No attribution required.
        </p>
      </CollapsibleContent>
    </Collapsible>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <Collapsible open={open} onOpenChange={setOpen} className='w-80'>
        <CollapsibleTrigger asChild>
          <Button variant='outline' className='w-full justify-between'>
            How do I get started?
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className='p-4 border border-t-0 rounded-b-md'>
          <div className='space-y-2 text-sm text-muted-foreground'>
            <p>1. Install the required dependencies</p>
            <p>2. Copy and paste the component source code</p>
            <p>3. Adapt it to your needs</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
}

export const FAQ: Story = {
  render: () => {
    const faqs = [
      {
        question: 'Is it accessible?',
        answer: 'Yes. It adheres to the WAI-ARIA design pattern.',
      },
      {
        question: 'Is it styled?',
        answer: 'Yes. It comes with default styles that you can customize.',
      },
      {
        question: 'Can I use it in my project?',
        answer: 'Yes. Free to use for personal and commercial projects.',
      },
    ]

    return (
      <div className='w-80 space-y-2'>
        {faqs.map((faq, index) => (
          <Collapsible key={index}>
            <CollapsibleTrigger asChild>
              <Button variant='ghost' className='w-full justify-between text-left'>
                {faq.question}
                <ChevronDown className='h-4 w-4' />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className='px-4 pb-2'>
              <p className='text-sm text-muted-foreground'>{faq.answer}</p>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    )
  },
}
