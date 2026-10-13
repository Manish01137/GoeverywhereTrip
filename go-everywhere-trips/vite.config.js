import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // In dev, PHP endpoints (PayU checkout) are served by `npm run php` on port 8000.
  server: { proxy: { '/api': 'http://localhost:8000' } },
})
