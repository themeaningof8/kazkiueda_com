import type { Preview } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { createElement } from 'react'
import '../src/styles/globals.css'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => 
      createElement(MemoryRouter, { initialEntries: ['/'] }, createElement(Story))
  ],
}

export default preview