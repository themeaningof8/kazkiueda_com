import type { Meta, StoryObj } from '@storybook/react'

import { Slider } from './Slider'

const meta = {
  title: 'Components/UI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: { type: 'object' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
    },
    min: {
      control: { type: 'number' },
    },
    max: {
      control: { type: 'number' },
    },
    step: {
      control: { type: 'number' },
    },
  },
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 1,
  },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: [50],
  },
}

export const CustomRange: Story = {
  args: {
    min: 0,
    max: 1000,
    step: 50,
    defaultValue: [300],
  },
}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    defaultValue: [50],
  },
  render: args => (
    <div className='h-48'>
      <Slider {...args} />
    </div>
  ),
}

export const WithLabels: Story = {
  render: () => (
    <div className='w-80 space-y-6'>
      <div className='space-y-3'>
        <label className='text-sm font-medium'>音量: 50%</label>
        <Slider defaultValue={[50]} max={100} step={1} />
      </div>

      <div className='space-y-3'>
        <label className='text-sm font-medium'>価格範囲: ¥2,000 - ¥8,000</label>
        <Slider defaultValue={[2000, 8000]} max={10000} min={0} step={100} />
      </div>

      <div className='space-y-3'>
        <label className='text-sm font-medium'>透明度: 80%</label>
        <Slider defaultValue={[80]} max={100} step={5} />
      </div>
    </div>
  ),
}

export const MultipleRanges: Story = {
  render: () => (
    <div className='w-80 space-y-4'>
      <Slider defaultValue={[10]} max={100} />
      <Slider defaultValue={[20, 80]} max={100} />
      <Slider defaultValue={[10, 40, 90]} max={100} />
    </div>
  ),
}
