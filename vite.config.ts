import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: [
      '4c6c1a22add1.ngrok-free.app'
    ]
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})
