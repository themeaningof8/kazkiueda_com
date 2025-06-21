import { render, screen } from '@testing-library/react'

import { Slider } from './Slider'

describe('Slider', () => {
  it('renders slider with default value', () => {
    render(<Slider defaultValue={[50]} data-testid='slider' />)
    const slider = screen.getByTestId('slider')
    expect(slider).toBeInTheDocument()
    const sliderInput = screen.getByRole('slider')
    expect(sliderInput).toBeInTheDocument()
  })

  it('renders with range values', () => {
    render(<Slider defaultValue={[25, 75]} data-testid='slider' />)
    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(2)
  })

  it('can be disabled', () => {
    render(<Slider disabled defaultValue={[50]} data-testid='slider' />)
    const slider = screen.getByTestId('slider')
    expect(slider).toHaveAttribute('data-disabled')
  })

  it('applies custom className', () => {
    render(<Slider className='custom-class' defaultValue={[50]} data-testid='slider' />)
    const slider = screen.getByTestId('slider')
    expect(slider).toHaveClass('custom-class')
  })

  it('supports controlled mode', () => {
    const handleValueChange = vi.fn()
    render(<Slider value={[30]} onValueChange={handleValueChange} data-testid='slider' />)

    const slider = screen.getByTestId('slider')
    expect(slider).toBeInTheDocument()
  })

  it('supports custom min and max values', () => {
    render(<Slider min={10} max={90} defaultValue={[50]} data-testid='slider' />)
    // Radix UIでは実際のinput要素にmin/maxが設定される
    const sliderInput = screen.getByRole('slider')
    expect(sliderInput).toHaveAttribute('aria-valuemin', '10')
    expect(sliderInput).toHaveAttribute('aria-valuemax', '90')
  })

  it('supports step values', () => {
    render(<Slider step={5} defaultValue={[50]} data-testid='slider' />)
    const slider = screen.getByTestId('slider')
    expect(slider).toBeInTheDocument()
  })

  it('supports vertical orientation', () => {
    render(<Slider orientation='vertical' defaultValue={[50]} data-testid='slider' />)
    const slider = screen.getByTestId('slider')
    expect(slider).toHaveAttribute('data-orientation', 'vertical')
  })

  it('has proper ARIA attributes', () => {
    render(<Slider defaultValue={[50]} min={0} max={100} data-testid='slider' />)
    const sliderElement = screen.getByRole('slider')
    expect(sliderElement).toHaveAttribute('aria-valuemin', '0')
    expect(sliderElement).toHaveAttribute('aria-valuemax', '100')
    expect(sliderElement).toHaveAttribute('aria-valuenow', '50')
  })

  it('renders slider track and range', () => {
    render(<Slider defaultValue={[50]} data-testid='slider' />)
    const slider = screen.getByTestId('slider')

    // Check for track element
    const track = slider.querySelector('[data-slot="slider-track"]')
    expect(track).toBeInTheDocument()

    // Check for range element
    const range = slider.querySelector('[data-slot="slider-range"]')
    expect(range).toBeInTheDocument()

    // Check for thumb element
    const thumb = slider.querySelector('[data-slot="slider-thumb"]')
    expect(thumb).toBeInTheDocument()
  })
})
