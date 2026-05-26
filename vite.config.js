import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Base path for GitHub Pages — must match your repo name
  // e.g. https://dendaniel97.github.io/pantaukrisis-dashboard/
  base: '/pantaukrisis-dashboard/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
