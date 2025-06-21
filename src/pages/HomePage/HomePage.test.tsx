import { render, screen } from '@testing-library/react'
import HomePage from './index'

describe('HomePage', () => {
  it('renders welcome message', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Welcome to Kazk Iueda')).toBeInTheDocument()
    expect(screen.getByText(/Reactアプリケーションテンプレートへようこそ/)).toBeInTheDocument()
    expect(screen.getByText('詳細を見る')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })
}) 