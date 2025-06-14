import type { Preview } from '@storybook/react';
import '../src/styles/global.css'; // TailwindCSSの読み込み

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      autodocs: 'tag',
      defaultName: 'Documentation'
    },
    layout: 'centered',
    // アクセシビリティテスト設定
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'keyboard-navigation', enabled: true }
        ]
      }
    },
    // レスポンシブテスト設定
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
          type: 'mobile'
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet'
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1200px', height: '800px' },
          type: 'desktop'
        }
      }
    },
    // 背景色設定
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#333333',
        },
      ],
    },
  },
  tags: ['autodocs']
};

export default preview;
