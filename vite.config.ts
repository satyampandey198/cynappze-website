import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    transformer: 'postcss',
  },
  server: {
    allowedHosts: ['justness-dinner-conclude.ngrok-free.dev'],
  },
  build: {
    cssMinify: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor'
            if (id.includes('three') || id.includes('@react-three')) return 'three-vendor'
            if (id.includes('framer-motion')) return 'motion-vendor'
          }
          return undefined
        },
      },
    },
  },
})