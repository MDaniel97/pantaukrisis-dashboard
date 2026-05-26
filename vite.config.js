import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Base path for GitHub Pages — must match your repo name
  // e.g. https://mdaniel97.github.io/pantaukrisis-dashboard/
  base: '/pantaukrisis-dashboard/',
  plugins: [react()],
  // Vite 5 doesn't forward shell env vars to import.meta.env automatically.
  // __API_URL__ is replaced at build time with the value of VITE_API_URL.
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || ''),
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
