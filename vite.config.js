import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        live: resolve(__dirname, 'live.html'),
        wizard: resolve(__dirname, 'wizard.html'),
        preclosed: resolve(__dirname, 'preclosed.html')
      }
    }
  }
})

