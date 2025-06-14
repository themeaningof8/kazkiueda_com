import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Design System/Spacing',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'プロジェクトで使用されるスペーシングスケール。8pxベースの一貫したスペーシングシステムです。',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SpacingScale: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">
          スペーシングスケール（8px Base）
        </h2>
        <div className="space-y-4">
          {[
            { size: '0.5', px: '2px', class: 'space-x-0.5' },
            { size: '1', px: '4px', class: 'space-x-1' },
            { size: '2', px: '8px', class: 'space-x-2' },
            { size: '3', px: '12px', class: 'space-x-3' },
            { size: '4', px: '16px', class: 'space-x-4' },
            { size: '6', px: '24px', class: 'space-x-6' },
            { size: '8', px: '32px', class: 'space-x-8' },
            { size: '12', px: '48px', class: 'space-x-12' },
            { size: '16', px: '64px', class: 'space-x-16' },
            { size: '20', px: '80px', class: 'space-x-20' },
            { size: '24', px: '96px', class: 'space-x-24' },
          ].map(({ size, px, class: className }) => (
            <div key={size} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium">
                {size} ({px})
              </div>
              <div className="flex-1 flex items-center">
                <div className="bg-blue-100 h-8 rounded flex items-center px-2">
                  <div
                    className={`bg-blue-500 h-2 rounded`}
                    style={{ width: px }}
                  />
                </div>
                <code className="ml-4 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {className}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">パディング（Padding）</h2>
        <div className="space-y-4">
          {[
            { size: '2', class: 'p-2' },
            { size: '4', class: 'p-4' },
            { size: '6', class: 'p-6' },
            { size: '8', class: 'p-8' },
          ].map(({ size, class: className }) => (
            <div key={size} className="flex items-center gap-4">
              <div className="w-16 text-sm font-medium">p-{size}</div>
              <div className="border-2 border-dashed border-gray-300">
                <div
                  className={`bg-blue-100 border border-blue-300 ${className}`}
                >
                  <div className="bg-blue-500 text-white text-sm px-2 py-1 rounded">
                    Content
                  </div>
                </div>
              </div>
              <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {className}
              </code>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">マージン（Margin）</h2>
        <div className="space-y-6">
          {[
            { size: '2', class: 'm-2' },
            { size: '4', class: 'm-4' },
            { size: '6', class: 'm-6' },
            { size: '8', class: 'm-8' },
          ].map(({ size, class: className }) => (
            <div key={size} className="flex items-center gap-4">
              <div className="w-16 text-sm font-medium">m-{size}</div>
              <div className="border-2 border-dashed border-gray-300 p-4 inline-block">
                <div
                  className={`bg-blue-500 text-white text-sm px-2 py-1 rounded ${className}`}
                >
                  Content
                </div>
              </div>
              <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {className}
              </code>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">ギャップ（Gap）</h2>
        <div className="space-y-4">
          {[
            { size: '2', class: 'gap-2' },
            { size: '4', class: 'gap-4' },
            { size: '6', class: 'gap-6' },
            { size: '8', class: 'gap-8' },
          ].map(({ size, class: className }) => (
            <div key={size} className="flex items-center gap-6">
              <div className="w-16 text-sm font-medium">gap-{size}</div>
              <div
                className={`flex ${className} border-2 border-dashed border-gray-300 p-2`}
              >
                <div className="bg-blue-500 text-white text-sm px-2 py-1 rounded">
                  Item 1
                </div>
                <div className="bg-blue-500 text-white text-sm px-2 py-1 rounded">
                  Item 2
                </div>
                <div className="bg-blue-500 text-white text-sm px-2 py-1 rounded">
                  Item 3
                </div>
              </div>
              <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {className}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'プロジェクトで使用される全スペーシングトークン。8pxベースの一貫したスペーシングシステムです。',
      },
    },
  },
};
