import { defineConfig } from 'vite'
import honox from 'honox/vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [honox(), tailwindcss()],
}) 