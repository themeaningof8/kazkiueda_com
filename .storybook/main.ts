import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-a11y',            // アクセシビリティ
    '@storybook/addon-viewport',        // レスポンシブ確認
    '@storybook/addon-docs',            // ドキュメント
    '@storybook/addon-controls',        // コントロール
    '@storybook/addon-actions',         // アクション
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },

  viteFinal: (config) => {
    // Vite最適化設定
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@': '/src',
        },
      },
      build: {
        ...config.build,
        rollupOptions: {
          ...config.build?.rollupOptions,
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              storybook: ['@storybook/react']
            }
          }
        }
      }
    };
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

export default config;