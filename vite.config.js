import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dev-only: forward /api/maas2 to upstream so local dev mirrors the
    // production Edge Function proxy (api/maas2.js). The dev server makes
    // a server-side fetch, so no CORS preflight is involved. The Edge
    // proxy handles caching + JSON normalization in production; this
    // proxy just keeps the fetch path identical across environments.
    proxy: {
      '/api/maas2': {
        target: 'https://api.maas2.apollorion.com',
        changeOrigin: true,
        rewrite: () => '/',
      },
    },
  },
})
