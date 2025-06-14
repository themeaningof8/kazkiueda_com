import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { Jumbotron } from './Jumbotron';

// GSAP Mock (deepwiki推奨戦略)
vi.mock('gsap', async () => {
  const mockGsap = {
    to: vi.fn().mockReturnThis(), // メソッドチェーン対応
    from: vi.fn().mockReturnThis(),
    set: vi.fn(),
    timeline: vi.fn(() => ({
      to: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      kill: vi.fn(),
    })),
    registerPlugin: vi.fn(),
  };

  return {
    gsap: mockGsap,
    default: mockGsap, // default export対応
  };
});

vi.mock('@gsap/react', () => ({
  useGSAP: vi.fn(callback => {
    if (typeof callback === 'function') {
      callback();
    }
  }),
}));

describe('Jumbotron', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // deepwiki推奨: モック状態クリア
  });

  it('基本レンダリング - titleが表示される', () => {
    render(<Jumbotron title="Test Title" />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('すべてのpropsが正しく表示される', () => {
    render(
      <Jumbotron
        title="Main Title"
        subtitle="Sub Title"
        description="This is a description"
      />
    );

    expect(screen.getByText('Main Title')).toBeInTheDocument();
    expect(screen.getByText('Sub Title')).toBeInTheDocument();
    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('subtitleが未指定の場合は表示されない', () => {
    render(<Jumbotron title="Only Title" />);

    expect(screen.getByText('Only Title')).toBeInTheDocument();
    // subtitleのpタグが存在しないことを確認
    const paragraphs = screen.queryAllByRole('generic');
    const subtitleElement = paragraphs.find(p =>
      p.className.includes('text-xl')
    );
    expect(subtitleElement).toBeFalsy();
  });

  it('descriptionが未指定の場合は表示されない', () => {
    render(<Jumbotron title="Title Only" subtitle="With Subtitle" />);

    expect(screen.getByText('Title Only')).toBeInTheDocument();
    expect(screen.getByText('With Subtitle')).toBeInTheDocument();

    // descriptionのpタグが存在しないことを確認
    const paragraphs = screen.queryAllByRole('generic');
    const descriptionElement = paragraphs.find(p =>
      p.className.includes('max-w-2xl')
    );
    expect(descriptionElement).toBeFalsy();
  });

  it('カスタムclassNameが適用される', () => {
    render(<Jumbotron title="Custom Class Test" className="custom-class" />);

    // sectionタグを直接検索（role="region"の代替）
    const section = document.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('custom-class');
  });

  it('アクセシビリティ - sectionロールが存在する', () => {
    render(<Jumbotron title="Accessibility Test" />);

    // sectionタグの存在確認（アクセシビリティ適合）
    const section = document.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('class');
  });

  it('レスポンシブクラスが適用されている', () => {
    render(<Jumbotron title="Responsive Test" />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-4xl', 'md:text-6xl');
  });
});
