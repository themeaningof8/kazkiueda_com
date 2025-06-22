import type { Meta, StoryObj } from '@storybook/react-vite'

import { Progress } from './Progress'

const meta = {
  title: 'Components/UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 50,
  },
}

export const Empty: Story = {
  args: {
    value: 0,
  },
}

export const Half: Story = {
  args: {
    value: 50,
  },
}

export const Complete: Story = {
  args: {
    value: 100,
  },
}

export const CustomSize: Story = {
  args: {
    value: 75,
    className: 'h-4',
  },
}

export const WithLabel: Story = {
  args: {
    value: 60,
  },
  render: args => (
    <div className='w-80 space-y-2'>
      <div className='flex justify-between text-sm'>
        <span>Loading...</span>
        <span>{args.value}%</span>
      </div>
      <Progress {...args} />
    </div>
  ),
}

export const MultipleProgress: Story = {
  render: () => (
    <div className='w-80 space-y-4'>
      {[
        { label: 'HTML', value: 90, color: 'bg-orange-500' },
        { label: 'CSS', value: 85, color: 'bg-blue-500' },
        { label: 'JavaScript', value: 75, color: 'bg-yellow-500' },
        { label: 'React', value: 60, color: 'bg-cyan-500' },
      ].map(skill => (
        <div key={skill.label} className='space-y-1'>
          <div className='flex justify-between text-sm'>
            <span>{skill.label}</span>
            <span>{skill.value}%</span>
          </div>
          <Progress value={skill.value} />
        </div>
      ))}
    </div>
  ),
}
