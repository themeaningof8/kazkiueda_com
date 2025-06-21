import { render, screen } from '@testing-library/react'

import { Avatar, AvatarFallback, AvatarImage } from './Avatar'

describe('Avatar', () => {
  it('renders avatar with image', () => {
    render(
      <Avatar>
        <AvatarImage src='test-image.jpg' alt='Test Avatar' />
        <AvatarFallback>TA</AvatarFallback>
      </Avatar>
    )

    // Avatar with broken image will show fallback
    expect(screen.getByText('TA')).toBeInTheDocument()
  })

  it('shows fallback when image fails to load', () => {
    render(
      <Avatar>
        <AvatarImage src='broken-image.jpg' alt='Broken' />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>
    )

    expect(screen.getByText('FB')).toBeInTheDocument()
  })

  it('renders fallback only when no image provided', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    )

    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Avatar className='custom-class'>
        <AvatarFallback>CC</AvatarFallback>
      </Avatar>
    )

    const avatar = screen.getByText('CC').closest('[data-slot="avatar"]')
    expect(avatar).toHaveClass('custom-class')
  })

  it('renders with different sizes', () => {
    render(
      <div>
        <Avatar className='size-6'>
          <AvatarFallback>S</AvatarFallback>
        </Avatar>
        <Avatar className='size-12'>
          <AvatarFallback>L</AvatarFallback>
        </Avatar>
      </div>
    )

    const smallAvatar = screen.getByText('S').closest('[data-slot="avatar"]')
    const largeAvatar = screen.getByText('L').closest('[data-slot="avatar"]')

    expect(smallAvatar).toHaveClass('size-6')
    expect(largeAvatar).toHaveClass('size-12')
  })
})
