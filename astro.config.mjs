import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// 開発モードかどうかを判定（コマンドラインの引数をチェック）
const isDev = process.argv.includes('dev');

export default defineConfig({
  site: 'https://example.com',
  output: isDev ? 'static' : 'server',
  adapter: isDev ? undefined : cloudflare({
    imageService: 'passthrough',
    platformProxy: {
      enabled: true,
      configPath: './wrangler.toml'
    }
  }),
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    mdx(),
    sitemap(),
    react(),
  ],
});