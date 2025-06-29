import { render, screen } from '@testing-library/react'
import { Bar, BarChart, ResponsiveContainer } from 'recharts'
import { describe, expect, it, vi } from 'vitest'

import {
  type ChartConfig,
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
  useChart,
} from './Chart'

// Mock ResponsiveContainer to disable warnings
vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts')
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 500, height: 500 }}>{children}</div>
    ),
  }
})

const mockConfig: ChartConfig = {
  desktop: {
    label: 'Desktop',
    color: '#8884d8',
  },
  mobile: {
    label: 'Mobile',
    color: '#82ca9d',
  },
}

const mockData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
]

describe('ChartContainer', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ChartContainer config={mockConfig}>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={mockData}>
            <Bar dataKey='desktop' fill='var(--color-desktop)' />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    )

    // ResponsiveContainerはコンテナ要素としてレンダリングされるため、data-chartでテストします
    expect(container.firstChild).toHaveAttribute('data-chart')
  })

  it('applies custom className', () => {
    const { container } = render(
      <ChartContainer config={mockConfig} className='custom-class'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={mockData}>
            <Bar dataKey='desktop' fill='var(--color-desktop)' />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('uses custom id when provided', () => {
    const { container } = render(
      <ChartContainer config={mockConfig} id='custom-chart'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={mockData}>
            <Bar dataKey='desktop' fill='var(--color-desktop)' />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    )

    expect(container.firstChild).toHaveAttribute('data-chart', 'chart-custom-chart')
  })

  it('generates unique id when not provided', () => {
    const { container } = render(
      <ChartContainer config={mockConfig}>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={mockData}>
            <Bar dataKey='desktop' fill='var(--color-desktop)' />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    )

    const element = container.firstChild as HTMLElement
    const chartId = element.getAttribute('data-chart')
    expect(chartId).toMatch(/^chart-/)
  })

  it('provides chart context to child components', () => {
    const TestComponent = () => {
      const context = useChart()
      return <div data-testid='context-config'>{JSON.stringify(context.config)}</div>
    }

    render(
      <ChartContainer config={mockConfig}>
        <TestComponent />
      </ChartContainer>
    )

    expect(screen.getByTestId('context-config')).toHaveTextContent(JSON.stringify(mockConfig))
  })
})

describe('ChartTooltipContent', () => {
  const mockPayload = [
    {
      dataKey: 'desktop',
      name: 'desktop',
      value: 186,
      color: '#8884d8',
      payload: { month: 'January', desktop: 186, mobile: 80 },
    },
  ]

  it('renders tooltip content when active with payload', () => {
    render(
      <ChartContainer config={mockConfig}>
        <ChartTooltipContent active={true} payload={mockPayload} label='January' />
      </ChartContainer>
    )

    expect(screen.getByText('186')).toBeInTheDocument()
    expect(screen.getByText('Desktop')).toBeInTheDocument()
  })

  it('returns null when not active', () => {
    const { container } = render(
      <ChartContainer config={mockConfig}>
        <ChartTooltipContent active={false} payload={mockPayload} label='January' />
      </ChartContainer>
    )

    // ChartTooltipContentが非アクティブの場合はnullを返すことを確認
    const tooltipContent = container.querySelector('[role="tooltip"]')
    expect(tooltipContent).not.toBeInTheDocument()
  })

  it('returns null when payload is empty', () => {
    const { container } = render(
      <ChartContainer config={mockConfig}>
        <ChartTooltipContent active={true} payload={[]} label='January' />
      </ChartContainer>
    )

    // payloadが空の場合はnullを返すことを確認
    const tooltipContent = container.querySelector('[role="tooltip"]')
    expect(tooltipContent).not.toBeInTheDocument()
  })

  it('hides label when hideLabel is true', () => {
    render(
      <ChartContainer config={mockConfig}>
        <ChartTooltipContent active={true} payload={mockPayload} label='January' hideLabel={true} />
      </ChartContainer>
    )

    expect(screen.queryByText('January')).not.toBeInTheDocument()
  })

  it('hides indicator when hideIndicator is true', () => {
    const { container } = render(
      <ChartContainer config={mockConfig}>
        <ChartTooltipContent
          active={true}
          payload={mockPayload}
          label='January'
          hideIndicator={true}
        />
      </ChartContainer>
    )

    const indicator = container.querySelector('.shrink-0.rounded-\\[2px\\]')
    expect(indicator).not.toBeInTheDocument()
  })

  it('uses custom indicator type', () => {
    const { container } = render(
      <ChartContainer config={mockConfig}>
        <ChartTooltipContent active={true} payload={mockPayload} label='January' indicator='line' />
      </ChartContainer>
    )

    const indicator = container.querySelector('.w-1')
    expect(indicator).toBeInTheDocument()
  })

  it('uses dashed indicator type', () => {
    const { container } = render(
      <ChartContainer config={mockConfig}>
        <ChartTooltipContent
          active={true}
          payload={mockPayload}
          label='January'
          indicator='dashed'
        />
      </ChartContainer>
    )

    const indicator = container.querySelector('.border-dashed')
    expect(indicator).toBeInTheDocument()
  })

  it('uses custom formatter when provided', () => {
    const formatter = vi.fn(value => `$${value}`)

    render(
      <ChartContainer config={mockConfig}>
        <ChartTooltipContent
          active={true}
          payload={mockPayload}
          label='January'
          formatter={formatter}
        />
      </ChartContainer>
    )

    expect(formatter).toHaveBeenCalledWith(
      186,
      'desktop',
      mockPayload[0],
      0,
      mockPayload[0]?.payload
    )
  })

  it('uses custom labelFormatter when provided', () => {
    const labelFormatter = vi.fn(value => `Month: ${value}`)

    render(
      <ChartContainer config={mockConfig}>
        <ChartTooltipContent
          active={true}
          payload={mockPayload}
          label='January'
          labelFormatter={labelFormatter}
        />
      </ChartContainer>
    )

    expect(labelFormatter).toHaveBeenCalledWith('January', mockPayload)
  })

  it('applies custom className', () => {
    const { container } = render(
      <ChartContainer config={mockConfig}>
        <ChartTooltipContent
          active={true}
          payload={mockPayload}
          label='January'
          className='custom-tooltip'
        />
      </ChartContainer>
    )

    expect(container.querySelector('.custom-tooltip')).toBeInTheDocument()
  })
})

describe('ChartLegendContent', () => {
  const mockLegendPayload = [
    { value: 'desktop', color: '#8884d8', dataKey: 'desktop' },
    { value: 'mobile', color: '#82ca9d', dataKey: 'mobile' },
  ]

  it('renders legend content with payload', () => {
    render(
      <ChartContainer config={mockConfig}>
        <ChartLegendContent payload={mockLegendPayload} />
      </ChartContainer>
    )

    expect(screen.getByText('Desktop')).toBeInTheDocument()
    expect(screen.getByText('Mobile')).toBeInTheDocument()
  })

  it('returns null when payload is empty', () => {
    const { container } = render(
      <ChartContainer config={mockConfig}>
        <ChartLegendContent payload={[]} />
      </ChartContainer>
    )

    // payloadが空の場合はnullを返すことを確認
    const legendContent = container.querySelector('[data-testid="legend-content"]')
    expect(legendContent).not.toBeInTheDocument()
  })

  it('hides icons when hideIcon is true', () => {
    const { container } = render(
      <ChartContainer config={mockConfig}>
        <ChartLegendContent payload={mockLegendPayload} hideIcon={true} />
      </ChartContainer>
    )

    const icons = container.querySelectorAll('.h-2.w-2')
    expect(icons).toHaveLength(2) // Color indicators should still be present
  })

  it('applies custom className', () => {
    const { container } = render(
      <ChartContainer config={mockConfig}>
        <ChartLegendContent payload={mockLegendPayload} className='custom-legend' />
      </ChartContainer>
    )

    expect(container.querySelector('.custom-legend')).toBeInTheDocument()
  })

  it('changes alignment for top position', () => {
    const { container } = render(
      <ChartContainer config={mockConfig}>
        <ChartLegendContent payload={mockLegendPayload} verticalAlign='top' />
      </ChartContainer>
    )

    expect(container.querySelector('.pb-3')).toBeInTheDocument()
  })

  it('uses custom nameKey', () => {
    const customPayload = [
      { customKey: 'desktop', color: '#8884d8', dataKey: 'desktop', value: 'desktop' },
    ]

    render(
      <ChartContainer config={mockConfig}>
        <ChartLegendContent payload={customPayload} nameKey='customKey' />
      </ChartContainer>
    )

    expect(screen.getByText('Desktop')).toBeInTheDocument()
  })
})

describe('Chart configuration', () => {
  it('handles theme-based configuration', () => {
    const themeConfig: ChartConfig = {
      desktop: {
        label: 'Desktop',
        theme: {
          light: '#8884d8',
          dark: '#6366f1',
        },
      },
    }

    const { container } = render(
      <ChartContainer config={themeConfig}>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={mockData}>
            <Bar dataKey='desktop' fill='var(--color-desktop)' />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    )

    // テーマベースの設定が適用されていることを確認
    expect(container.firstChild).toHaveAttribute('data-chart')
  })

  it('handles configuration with icons', () => {
    const IconComponent = () => <svg data-testid='custom-icon' />

    const iconConfig: ChartConfig = {
      desktop: {
        label: 'Desktop',
        color: '#8884d8',
        icon: IconComponent,
      },
    }

    const mockPayload = [
      {
        dataKey: 'desktop',
        name: 'desktop',
        value: 186,
        color: '#8884d8',
        payload: { month: 'January', desktop: 186 },
      },
    ]

    render(
      <ChartContainer config={iconConfig}>
        <ChartTooltipContent active={true} payload={mockPayload} label='January' />
      </ChartContainer>
    )

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })
})

describe('Error handling', () => {
  it('throws error when useChart is used outside ChartContainer', () => {
    const TestComponent = () => {
      useChart() // This should throw
      return <div>Test</div>
    }

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<TestComponent />)).toThrow(
      'useChart must be used within a <ChartContainer />'
    )

    consoleSpy.mockRestore()
  })
})
