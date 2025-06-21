import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from './Layout'

const LayoutWithRouter = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <Layout>{children}</Layout>
  </BrowserRouter>
)

describe('Layout', () => {
  it('renders navigation and children', () => {
    render(
      <LayoutWithRouter>
        <div>Test Content</div>
      </LayoutWithRouter>
    )

    // ナビゲーションの確認
    expect(screen.getByText('Kazk Iueda')).toBeInTheDocument()
    expect(screen.getByText('ホーム')).toBeInTheDocument()
    expect(screen.getByText('アバウト')).toBeInTheDocument()

    // 子コンポーネントの確認
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })
}) 