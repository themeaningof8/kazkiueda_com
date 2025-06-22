import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"
  ],
  "addons": [
    'storybook/actions',
    'storybook/highlight',
    'storybook/viewport',
    'storybook/test',
    '@storybook/addon-links',
    '@storybook/addon-docs',
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  "typescript": {
    "check": false,
    "reactDocgen": 'react-docgen-typescript',
    "reactDocgenTypescriptOptions": {
      "shouldExtractLiteralValuesFromEnum": true,
      "propFilter": (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};
export default config;