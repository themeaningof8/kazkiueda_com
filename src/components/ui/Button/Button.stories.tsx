import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/UI/Button', // 階層化命名
  component: Button,
  parameters: {
    layout: 'centered', // レイアウト設定
    docs: {
      description: {
        component:
          'プロジェクトの基本ボタンコンポーネント。Radix UI Slotを使用し、shadcn/uiのデザインシステムに基づいています。',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
      description: 'ボタンの視覚的バリエーション',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'ボタンのサイズ',
    },
    asChild: {
      control: 'boolean',
      description: 'Radix UI Slotとして使用するかどうか',
    },
    disabled: {
      control: 'boolean',
      description: 'ボタンを無効化するかどうか',
    },
  },
  tags: ['autodocs'], // 自動ドキュメント生成
};

export default meta;
type Story = StoryObj<typeof meta>;

// 基本Story
export const Default: Story = {
  args: {
    children: 'ボタン',
    variant: 'default',
  },
};

// 全バリエーション表示
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'すべてのボタンバリエーションを表示',
      },
    },
  },
};

// サイズバリエーション
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🔥</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'すべてのサイズバリエーションを表示',
      },
    },
  },
};

// インタラクションStory
export const WithInteraction: Story = {
  args: {
    children: 'クリックしてください',
    variant: 'default',
  },
  play: async ({ _canvasElement }) => {
    // インタラクションテストは後で実装
    // const canvas = within(_canvasElement);
    // const button = canvas.getByRole('button');
    // await userEvent.click(button);
    // await expect(button).toHaveClass('active');
  },
  parameters: {
    docs: {
      description: {
        story: 'ボタンのインタラクションテスト用',
      },
    },
  },
};

// 無効化状態
export const Disabled: Story = {
  args: {
    children: '無効化されたボタン',
    variant: 'default',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'ボタンの無効化状態',
      },
    },
  },
};

// アクセシビリティテスト
export const AccessibilityTest: Story = {
  args: {
    children: 'アクセシビリティテスト',
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'アクセシビリティテスト用のボタン',
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'keyboard-navigation', enabled: true },
        ],
      },
    },
  },
};

// レスポンシブテスト
export const ResponsiveTest: Story = {
  args: {
    children: 'レスポンシブテスト',
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'レスポンシブ表示確認用',
      },
    },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1200px', height: '800px' },
        },
      },
    },
  },
};
