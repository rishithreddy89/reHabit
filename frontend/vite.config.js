import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'class-variance-authority': path.resolve(__dirname, './src/vendor/class-variance-authority/index.js'),
      'tailwind-merge': path.resolve(__dirname, './src/vendor/tailwind-merge/index.js')
    }
  },
  server: {
    port: 5173
  }
})
