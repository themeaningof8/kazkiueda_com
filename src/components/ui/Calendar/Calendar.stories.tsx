import type { Meta, StoryObj } from '@storybook/react-vite'

import { Calendar } from './Calendar'

const meta = {
  title: 'Components/UI/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Calendar mode='single' />,
}

export const WithSelectedDate: Story = {
  render: () => <Calendar mode='single' selected={new Date()} />,
}

export const WithDateRange: Story = {
  render: () => <Calendar mode='range' />,
}

export const WithoutOutsideDays: Story = {
  render: () => <Calendar showOutsideDays={false} />,
}

export const WithWeekNumbers: Story = {
  render: () => <Calendar showWeekNumber />,
}

export const WithDropdownCaptions: Story = {
  render: () => <Calendar captionLayout='dropdown' />,
}

export const Multiple: Story = {
  render: () => <Calendar mode='multiple' />,
}

export const CustomStyling: Story = {
  render: () => (
    <Calendar className='border rounded-lg p-4 shadow-lg bg-card text-card-foreground' />
  ),
}
