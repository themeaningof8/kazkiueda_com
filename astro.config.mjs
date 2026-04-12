// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  redirects: {
    '/': {
      status: 302,
      destination: '/portfolio',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
