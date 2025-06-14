import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Design System/Colors',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'プロジェクトで使用されるカラーパレット。TailwindCSSの設計原則に基づいています。',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ColorPalette: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Primary Colors</h2>
        <div className="grid grid-cols-6 gap-4">
          <div className="text-center">
            <div className="bg-primary h-16 w-16 rounded-lg mx-auto shadow-sm" />
            <p className="text-sm mt-2 font-medium">Primary</p>
            <code className="text-xs text-gray-500">bg-primary</code>
          </div>
          <div className="text-center">
            <div className="bg-primary-foreground h-16 w-16 rounded-lg mx-auto shadow-sm" />
            <p className="text-sm mt-2 font-medium">Primary Foreground</p>
            <code className="text-xs text-gray-500">bg-primary-foreground</code>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Secondary Colors</h2>
        <div className="grid grid-cols-6 gap-4">
          <div className="text-center">
            <div className="bg-secondary h-16 w-16 rounded-lg mx-auto shadow-sm" />
            <p className="text-sm mt-2 font-medium">Secondary</p>
            <code className="text-xs text-gray-500">bg-secondary</code>
          </div>
          <div className="text-center">
            <div className="bg-secondary-foreground h-16 w-16 rounded-lg mx-auto shadow-sm" />
            <p className="text-sm mt-2 font-medium">Secondary Foreground</p>
            <code className="text-xs text-gray-500">
              bg-secondary-foreground
            </code>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Semantic Colors</h2>
        <div className="grid grid-cols-6 gap-4">
          <div className="text-center">
            <div className="bg-destructive h-16 w-16 rounded-lg mx-auto shadow-sm" />
            <p className="text-sm mt-2 font-medium">Destructive</p>
            <code className="text-xs text-gray-500">bg-destructive</code>
          </div>
          <div className="text-center">
            <div className="bg-accent h-16 w-16 rounded-lg mx-auto shadow-sm" />
            <p className="text-sm mt-2 font-medium">Accent</p>
            <code className="text-xs text-gray-500">bg-accent</code>
          </div>
          <div className="text-center">
            <div className="bg-muted h-16 w-16 rounded-lg mx-auto shadow-sm" />
            <p className="text-sm mt-2 font-medium">Muted</p>
            <code className="text-xs text-gray-500">bg-muted</code>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Background & Border</h2>
        <div className="grid grid-cols-6 gap-4">
          <div className="text-center">
            <div className="bg-background border h-16 w-16 rounded-lg mx-auto shadow-sm" />
            <p className="text-sm mt-2 font-medium">Background</p>
            <code className="text-xs text-gray-500">bg-background</code>
          </div>
          <div className="text-center">
            <div className="bg-foreground h-16 w-16 rounded-lg mx-auto shadow-sm" />
            <p className="text-sm mt-2 font-medium">Foreground</p>
            <code className="text-xs text-gray-500">bg-foreground</code>
          </div>
          <div className="text-center">
            <div className="bg-card h-16 w-16 rounded-lg mx-auto shadow-sm border" />
            <p className="text-sm mt-2 font-medium">Card</p>
            <code className="text-xs text-gray-500">bg-card</code>
          </div>
          <div className="text-center">
            <div className="bg-input h-16 w-16 rounded-lg mx-auto shadow-sm border" />
            <p className="text-sm mt-2 font-medium">Input</p>
            <code className="text-xs text-gray-500">bg-input</code>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'プロジェクトで使用される全カラートークン。各色はTailwindCSSクラスで参照可能です。',
      },
    },
  },
};
