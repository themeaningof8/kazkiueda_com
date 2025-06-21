import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navigation from './Navigation'

const NavigationWithRouter = () => (
  <BrowserRouter>
    <Navigation />
  </BrowserRouter>
)

describe('Navigation', () => {
  it('renders navigation links', () => {
    render(<NavigationWithRouter />)
    
    expect(screen.getByText('Kazk Iueda')).toBeInTheDocument()
    expect(screen.getByText('ホーム')).toBeInTheDocument()
    expect(screen.getByText('アバウト')).toBeInTheDocument()
  })

  it('has correct link URLs', () => {
    render(<NavigationWithRouter />)
    
    const homeLink = screen.getByText('ホーム')
    const aboutLink = screen.getByText('アバウト')
    
    expect(homeLink.closest('a')).toHaveAttribute('href', '/')
    expect(aboutLink.closest('a')).toHaveAttribute('href', '/about')
  })
}) 