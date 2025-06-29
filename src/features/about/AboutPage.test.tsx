import { render, screen } from '@testing-library/react'

import AboutPage from './index'

describe('AboutPage', () => {
  it('renders about content', () => {
    render(<AboutPage />)

    expect(screen.getByText('About')).toBeInTheDocument()
    expect(
      screen.getByText(/このアプリケーションは、モダンなReact開発環境のテンプレートです/)
    ).toBeInTheDocument()
    expect(screen.getByText('技術スタック')).toBeInTheDocument()
    expect(screen.getByText(/React 19/)).toBeInTheDocument()
    expect(screen.getByText('プロジェクト構造')).toBeInTheDocument()
  })
})
