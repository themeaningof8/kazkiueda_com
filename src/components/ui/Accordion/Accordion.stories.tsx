import type { Meta, StoryObj } from '@storybook/react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './Accordion'

const meta = {
  title: 'Components/UI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: 'single' as const,
    collapsible: true,
    className: 'w-full max-w-md',
  },
  render: args => (
    <Accordion {...args}>
      <AccordionItem value='item-1'>
        <AccordionTrigger>アコーディオン項目 1</AccordionTrigger>
        <AccordionContent>
          これは最初のアコーディオン項目のコンテンツです。ここには詳細な情報を含めることができます。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-2'>
        <AccordionTrigger>アコーディオン項目 2</AccordionTrigger>
        <AccordionContent>
          これは2番目のアコーディオン項目のコンテンツです。複数の段落を含めることも可能です。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-3'>
        <AccordionTrigger>アコーディオン項目 3</AccordionTrigger>
        <AccordionContent>
          最後のアコーディオン項目のコンテンツです。必要に応じて長いテキストも配置できます。
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const Multiple: Story = {
  args: {
    type: 'multiple' as const,
    className: 'w-full max-w-md',
  },
  render: args => (
    <Accordion {...args}>
      <AccordionItem value='item-1'>
        <AccordionTrigger>複数選択可能 1</AccordionTrigger>
        <AccordionContent>複数のアコーディオン項目を同時に開くことができます。</AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-2'>
        <AccordionTrigger>複数選択可能 2</AccordionTrigger>
        <AccordionContent>
          このモードでは、複数の項目を展開した状態を保持できます。
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
