import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Ishlab chiqish rejimida so'rovlar Java backend'ga (8080) yo'naltiriladi
    proxy: {
      '/api': 'http://localhost:8080',
      '/auth': 'http://localhost:8080',
      '/ws': { target: 'ws://localhost:8080', ws: true },
    },
  },
  build: {
    // "npm run build" natijasi to'g'ridan-to'g'ri Spring Boot ichiga tushadi
    outDir: '../backend/src/main/resources/static',
    emptyOutDir: true,
  },
})
