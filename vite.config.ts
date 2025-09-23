import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: [
      '95914a5533a5.ngrok-free.app'
    ]
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})
