import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Design System/Typography',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'プロジェクトで使用されるタイポグラフィスケール。読みやすさと階層性を重視した設計です。',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TypographyScale: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">見出し（Headings）</h2>
        <div className="space-y-6">
          <div className="flex items-baseline gap-4">
            <h1 className="text-4xl font-bold">見出し1</h1>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              text-4xl font-bold
            </code>
          </div>
          <div className="flex items-baseline gap-4">
            <h2 className="text-3xl font-semibold">見出し2</h2>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              text-3xl font-semibold
            </code>
          </div>
          <div className="flex items-baseline gap-4">
            <h3 className="text-2xl font-semibold">見出し3</h3>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              text-2xl font-semibold
            </code>
          </div>
          <div className="flex items-baseline gap-4">
            <h4 className="text-xl font-medium">見出し4</h4>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              text-xl font-medium
            </code>
          </div>
          <div className="flex items-baseline gap-4">
            <h5 className="text-lg font-medium">見出し5</h5>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              text-lg font-medium
            </code>
          </div>
          <div className="flex items-baseline gap-4">
            <h6 className="text-base font-medium">見出し6</h6>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              text-base font-medium
            </code>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">本文（Body Text）</h2>
        <div className="space-y-4">
          <div>
            <p className="text-base mb-2">通常の本文テキスト（Base）</p>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              text-base
            </code>
          </div>
          <div>
            <p className="text-lg mb-2">大きめの本文テキスト（Large）</p>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              text-lg
            </code>
          </div>
          <div>
            <p className="text-sm mb-2">小さめの本文テキスト（Small）</p>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              text-sm
            </code>
          </div>
          <div>
            <p className="text-xs mb-2">とても小さなテキスト（Extra Small）</p>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              text-xs
            </code>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">
          フォントウェイト（Font Weight）
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="font-light w-32">Light (300)</span>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              font-light
            </code>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-normal w-32">Normal (400)</span>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              font-normal
            </code>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium w-32">Medium (500)</span>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              font-medium
            </code>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold w-32">Semibold (600)</span>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              font-semibold
            </code>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold w-32">Bold (700)</span>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              font-bold
            </code>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">
          行間・文字間隔（Line Height & Letter Spacing）
        </h2>
        <div className="space-y-6">
          <div>
            <p className="text-base leading-tight mb-2">
              密な行間（Tight）-
              この文章は行間が狭く設定されています。長文での使用は避けることをお勧めします。
            </p>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              leading-tight
            </code>
          </div>
          <div>
            <p className="text-base leading-normal mb-2">
              通常の行間（Normal）-
              この文章は標準的な行間で表示されています。一般的な本文テキストに適しています。
            </p>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              leading-normal
            </code>
          </div>
          <div>
            <p className="text-base leading-relaxed mb-2">
              ゆったりとした行間（Relaxed）-
              この文章はゆったりとした行間で表示されています。読みやすさを重視する場面で使用します。
            </p>
            <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              leading-relaxed
            </code>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'プロジェクトで使用される全タイポグラフィトークン。見出しから本文まで階層的に設計されています。',
      },
    },
  },
};
