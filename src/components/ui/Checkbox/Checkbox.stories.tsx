import type { Meta, StoryObj } from '@storybook/react-vite'

import { Checkbox } from './Checkbox'

const meta = {
  title: 'Components/UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Checked: Story = {
  args: {
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className='flex items-center space-x-2'>
      <Checkbox id='terms' />
      <label
        htmlFor='terms'
        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
      >
        利用規約に同意する
      </label>
    </div>
  ),
}

export const FormExample: Story = {
  render: () => (
    <div className='space-y-3'>
      <div className='flex items-center space-x-2'>
        <Checkbox id='newsletter' />
        <label htmlFor='newsletter' className='text-sm'>
          ニュースレターを受信する
        </label>
      </div>
      <div className='flex items-center space-x-2'>
        <Checkbox id='marketing' />
        <label htmlFor='marketing' className='text-sm'>
          マーケティングメールを受信する
        </label>
      </div>
      <div className='flex items-center space-x-2'>
        <Checkbox id='updates' defaultChecked />
        <label htmlFor='updates' className='text-sm'>
          プロダクトアップデートを受信する
        </label>
      </div>
    </div>
  ),
}
