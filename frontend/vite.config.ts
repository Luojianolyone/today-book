import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const isPages = process.env.GITHUB_PAGES === 'true'

export default defineConfig({
  base: isPages ? '/today-book/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3003,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
