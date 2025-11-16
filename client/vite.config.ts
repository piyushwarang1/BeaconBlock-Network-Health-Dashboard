import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.browser': true,
    'process.version': '"v16.0.0"',
    'globalThis.Request': 'Request',
    'globalThis.Response': 'Response',
    'globalThis.fetch': 'fetch',
    'globalThis.Headers': 'Headers',
    'globalThis.FormData': 'FormData',
    'globalThis.URL': 'URL',
    'globalThis.URLSearchParams': 'URLSearchParams',
  },
  optimizeDeps: {
    include: ['@polkadot/api', '@polkadot/util', '@polkadot/util-crypto'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})