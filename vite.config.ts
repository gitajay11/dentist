import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Forward /api to the Node API (npm run dev:api) so the form works locally.
const apiProxy = {
  '/api': {
    target: `http://localhost:${process.env.API_PORT ?? 8787}`,
    changeOrigin: false,
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: apiProxy },
  // `npm run preview` serves the production build — it needs the same proxy.
  preview: { proxy: apiProxy },
  build: {
    target: 'es2022',
    cssMinify: 'lightningcss',
  },
})
