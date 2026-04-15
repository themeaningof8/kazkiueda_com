// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import rehypeSlug from 'rehype-slug';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  compressHTML: true,
  redirects: {
    '/': {
      status: 302,
      destination: '/case-study',
    },
    '/portfolio': {
      status: 302,
      destination: '/case-study',
    },
  },
  markdown: {
    rehypePlugins: [rehypeSlug],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
