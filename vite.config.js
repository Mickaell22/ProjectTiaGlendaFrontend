import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true, // Permite conexiones desde cualquier IP
    port: 3000,
  },
  preview: {
    host: true,
    port: 3000,
  },
})