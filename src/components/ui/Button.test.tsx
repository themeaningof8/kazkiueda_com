import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { Button } from './button';

describe('Button', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // 各テスト前の自動クリーンアップ
  });

  it('基本レンダリング', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('clickイベントが正常に動作する', () => {
    const mockHandler = vi.fn();
    render(<Button onClick={mockHandler}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('disabled状態では clickイベントが発火しない', () => {
    const mockHandler = vi.fn();
    render(
      <Button onClick={mockHandler} disabled>
        Disabled Button
      </Button>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('variant propsが正しく適用される', () => {
    render(<Button variant="destructive">Destructive Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });
});
