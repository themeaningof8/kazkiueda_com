import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Bar,
  BarChart,
  Cell,
  Line,
  Pie,
  PieChart,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
} from 'recharts'

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from './Chart'

const meta = {
  title: 'Components/UI/Chart',
  component: ChartContainer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible chart container component built on top of Recharts.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ChartContainer>

export default meta
type Story = StoryObj<typeof meta>

const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
]

const pieData = [
  { name: 'Desktop', value: 1220, fill: 'var(--color-desktop)' },
  { name: 'Mobile', value: 860, fill: 'var(--color-mobile)' },
  { name: 'Tablet', value: 300, fill: 'var(--color-tablet)' },
]

const chartConfig: ChartConfig = {
  desktop: {
    label: 'Desktop',
    color: '#8884d8',
  },
  mobile: {
    label: 'Mobile',
    color: '#82ca9d',
  },
  tablet: {
    label: 'Tablet',
    color: '#ffc658',
  },
}

export const BarChartDefault: Story = {
  args: {
    config: chartConfig,
    children: (
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={chartData}>
          <Bar dataKey='desktop' fill='var(--color-desktop)' />
          <Bar dataKey='mobile' fill='var(--color-mobile)' />
          <ChartTooltip content={<ChartTooltipContent />} />
        </BarChart>
      </ResponsiveContainer>
    ),
  },
  render: args => (
    <div className='w-[600px] h-[400px]'>
      <ChartContainer {...args} />
    </div>
  ),
}

export const BarChartWithLegend: Story = {
  args: {
    config: chartConfig,
    children: (
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={chartData}>
          <Bar dataKey='desktop' fill='var(--color-desktop)' />
          <Bar dataKey='mobile' fill='var(--color-mobile)' />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
        </BarChart>
      </ResponsiveContainer>
    ),
  },
  render: args => (
    <div className='w-[600px] h-[400px]'>
      <ChartContainer {...args} />
    </div>
  ),
}

export const LineChartStory: Story = {
  args: {
    config: chartConfig,
    children: (
      <ResponsiveContainer width='100%' height='100%'>
        <RechartsLineChart data={chartData}>
          <Line type='monotone' dataKey='desktop' stroke='var(--color-desktop)' strokeWidth={2} />
          <Line type='monotone' dataKey='mobile' stroke='var(--color-mobile)' strokeWidth={2} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
        </RechartsLineChart>
      </ResponsiveContainer>
    ),
  },
  render: args => (
    <div className='w-[600px] h-[400px]'>
      <ChartContainer {...args} />
    </div>
  ),
}

export const PieChartDefault: Story = {
  args: {
    config: chartConfig,
    children: (
      <ResponsiveContainer width='100%' height='100%'>
        <PieChart>
          <Pie data={pieData} cx='50%' cy='50%' labelLine={false} outerRadius={80} dataKey='value'>
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
        </PieChart>
      </ResponsiveContainer>
    ),
  },
  render: args => (
    <div className='w-[600px] h-[400px]'>
      <ChartContainer {...args} />
    </div>
  ),
}

export const WithCustomTooltip: Story = {
  args: {
    config: chartConfig,
    children: (
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={chartData}>
          <Bar dataKey='desktop' fill='var(--color-desktop)' />
          <Bar dataKey='mobile' fill='var(--color-mobile)' />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator='line'
                labelFormatter={value => `Period: ${value}`}
                formatter={value => [`${value} users`, '']}
              />
            }
          />
        </BarChart>
      </ResponsiveContainer>
    ),
  },
  render: args => (
    <div className='w-[600px] h-[400px]'>
      <ChartContainer {...args} />
    </div>
  ),
}

export const WithDashedIndicator: Story = {
  args: {
    config: chartConfig,
    children: (
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={chartData}>
          <Bar dataKey='desktop' fill='var(--color-desktop)' />
          <Bar dataKey='mobile' fill='var(--color-mobile)' />
          <ChartTooltip content={<ChartTooltipContent indicator='dashed' />} />
        </BarChart>
      </ResponsiveContainer>
    ),
  },
  render: args => (
    <div className='w-[600px] h-[400px]'>
      <ChartContainer {...args} />
    </div>
  ),
}

export const WithTheme: Story = {
  args: {
    config: {
      sales: {
        label: 'Sales',
        color: '#8884d8',
      },
      revenue: {
        label: 'Revenue',
        color: '#82ca9d',
      },
    },
    children: (
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={chartData}>
          <Bar dataKey='desktop' fill='var(--color-sales)' />
          <Bar dataKey='mobile' fill='var(--color-revenue)' />
          <ChartTooltip content={<ChartTooltipContent />} />
        </BarChart>
      </ResponsiveContainer>
    ),
  },
  render: args => (
    <div className='w-[600px] h-[400px]'>
      <ChartContainer {...args} />
    </div>
  ),
}

export const MinimalExample: Story = {
  args: {
    config: chartConfig,
    children: (
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={chartData}>
          <Bar dataKey='desktop' fill='var(--color-desktop)' />
        </BarChart>
      </ResponsiveContainer>
    ),
  },
  render: args => (
    <div className='w-[400px] h-[300px]'>
      <ChartContainer {...args} />
    </div>
  ),
}

export const ResponsiveChart: Story = {
  args: {
    config: chartConfig,
    children: (
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={chartData}>
          <Bar dataKey='desktop' fill='var(--color-desktop)' />
          <Bar dataKey='mobile' fill='var(--color-mobile)' />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
        </BarChart>
      </ResponsiveContainer>
    ),
  },
  render: args => (
    <div className='w-full h-[400px]'>
      <ChartContainer {...args} />
    </div>
  ),
}
