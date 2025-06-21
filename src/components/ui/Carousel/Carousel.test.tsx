import { render, screen } from '@testing-library/react'

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './Carousel'

describe('Carousel', () => {
  it('renders carousel component', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
          <CarouselItem>Item 2</CarouselItem>
          <CarouselItem>Item 3</CarouselItem>
        </CarouselContent>
      </Carousel>
    )
    const carousel = screen.getByRole('region')
    expect(carousel).toBeInTheDocument()
    expect(carousel).toHaveAttribute('aria-roledescription', 'carousel')
  })

  it('renders carousel items', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
          <CarouselItem>Item 2</CarouselItem>
          <CarouselItem>Item 3</CarouselItem>
        </CarouselContent>
      </Carousel>
    )

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('renders navigation buttons', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
          <CarouselItem>Item 2</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    )

    expect(screen.getByRole('button', { name: /previous slide/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next slide/i })).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Carousel className='custom-carousel'>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    )
    const carousel = screen.getByRole('region')
    expect(carousel).toHaveClass('custom-carousel')
  })

  it('supports vertical orientation', () => {
    render(
      <Carousel orientation='vertical'>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
          <CarouselItem>Item 2</CarouselItem>
        </CarouselContent>
      </Carousel>
    )
    const carousel = screen.getByRole('region')
    expect(carousel).toBeInTheDocument()
  })
})
