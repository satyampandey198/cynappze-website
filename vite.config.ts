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
    minify: 'terser',
    cssMinify: true,
    target: 'esnext',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        } as Record<string, string[]>,
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
})