import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [react(), viteCompression()],
  css: {
    transformer: 'postcss',
  },
  server: {
    allowedHosts: ['justness-dinner-conclude.ngrok-free.dev'],
  },
  build: {
    minify: 'esbuild',
    cssMinify: true,
    target: 'esnext',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor'
          }
          return undefined
        },
      },
    },
  },
})